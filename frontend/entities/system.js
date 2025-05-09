import Phaser from "phaser";
import * as nakamajs from "@heroiclabs/nakama-js";
import config from "../config.json";
import serverConfig from "../serverConfig.json";

const tickWindow_ms = 20; //20 ms

var currentTime = 0;
var elapsedTime = 0;
var gameStartTimestamp = 0;

class System {

  static match = null;
  static client = null;
  static socket = null;
  static session = null;
  static config = config;
  static playersList = [];
  static playersState = [];
  static allObjectsState = [];
  static outBufferAllObjectsState = [];

  static engineConfig = {
    type: Phaser.WEBGL,
    width: System.config.canvas.width - System.config.canvas.margin * 2,
    height: System.config.canvas.height - System.config.canvas.margin * 2,
    canvas: gameCanvas,
    physics: {
      default: "arcade",
      arcade: {
        gravity: { y: 0 },
        debug: true,
      },
    }
  };

  static async createNewMatch() {
    try {
      const matchName = "NoImpostersAllowed";
      System.match = await System.socket.createMatch(matchName);
      console.log("Match created:", System.match);
    } catch (error) {
      // //console.error("Failed to create match:", error);
    }
  }

  static async joinMatch(matchToJoinId = null) {
    let matchId = null;
    if (!matchToJoinId) {
      matchId = prompt('Enter Match ID to join:');
      // //console.log('Entered Match ID:', matchId);
    }
    else {
      matchId = matchToJoinId;
    }
    if (matchId) {
      //console.log("there is a matchId: " + matchId);
      try {
        System.match = await this.socket.joinMatch(matchId);
        //console.log('Joined match:', System.match);
        this.playersList = await this.listMatchPlayers();
        return true;
      } catch (error) {
        //console.error('Failed to join match:', error);
        window.alert('Failed to join match. Please check the Match ID and try again.');
        return false;
      }
    }
    else {
      //console.log("No matchId provided.");
      // window.alert('No Match ID provided. Please enter a valid Match ID.');
      return false;
    }

  }

  static async autoJoinFirstFoundMatch() {
    let firstFoundMatch = await System.listMatches();
    if (firstFoundMatch && firstFoundMatch.match_id) {
      //console.log("Joining match: ", firstFoundMatch.match_id);
      const joined = await System.joinMatch(firstFoundMatch.match_id);
      if (joined) {
        console.log("OK! --- Auto joined match: ", firstFoundMatch.match_id);
        console.log(firstFoundMatch);
        return true;
      }
    }
    else {
      //console.log("Failed to find a match to join.");
      return false;
    }
  }

  static async listMatches() {

    const result = await this.client.listMatches(this.session);

    if (!result.matches || result.matches.length === 0) {
      //console.log("No matches found.");
      return null;
    }

    //console.log("Found matches: ");
    result.matches.forEach(function (resultMatch) {
      //console.log(resultMatch);
    });

    // Return the first match in the list
    return result.matches[0];
  }

  static async listMatchPlayers() {
    let playersList = [];
    if (System.match && System.match.presences.length > 0) {
      //console.log("Players in Match: ");
      System.match.presences.forEach(presence => {
        playersList.push(presence.username);
      });
      //console.log(playersList);
    }
    return playersList;
  }

  static async syncMatchStatus(stateToSend) {

    // if (System.match && System.match.self) {
    //   console.log("Match created by:", System.match.self.username);
    //   console.log(System.match.self.user_id);
    // } else {
    //   console.log("Match creator information not available.");
    // }

    // Send and fetch match state every tickWindow_ms
    currentTime = Date.now();
    elapsedTime = currentTime - gameStartTimestamp;

    if (elapsedTime >= tickWindow_ms) {
      // console.log(`Elapsed time overflow: ${elapsedTime}ms`);
      // console.log(`tick: ${elapsedTime}ms`);
      gameStartTimestamp = currentTime; // Reset the start timestamp

      // //console.log("Sending match state:");
      // //console.log(state)
      const stateToSendString = JSON.stringify(stateToSend);
      System.socket.sendMatchState(System.match.match_id, 1, stateToSendString);


      System.writeAllObjects();
      System.readAllObjects();
      // //console.log(System.allObjectsState)

    }

    System.socket.onmatchdata = async (result) => {
      // //console.log("Received match state: \n");
      // //console.log(result); // Vai mostrar o Uint8Array
      const remoteData = result.data ? result.data : null;
      const remoteId = result.presence.user_id ? result.presence.user_id : null;
      const remoteName = result.presence.username ? result.presence.username : null;
      //console.log("Received from: ", remoteId, remoteName);

      if (remoteData) {

        // Decodifica o Uint8Array para string JSON
        const decoder = new TextDecoder("utf-8");
        const jsonString = decoder.decode(remoteData);

        // Faz o parse do JSON
        const receivedData = JSON.parse(jsonString);

        // //console.log("Parsed match state: \n");
        // //console.log(receivedData);
        const playerIndex = System.playersState.findIndex(
          (ply) => ply.playerId === receivedData.playerId
        );

        if (playerIndex !== -1) {
          // Update existing player data
          System.playersState[playerIndex] = { ...System.playersState[playerIndex], ...receivedData };
        } else {
          // Add new player entry
          System.playersState.push(receivedData);
        }
        // //console.log("Updated players state: \n");
        // //console.log(System.playersState);
      }
    }



  }


  static async writeObject(object_id = "someone_forgot_object_id", x = 0, y = 0) {

    // Check if object_id already exists in the buffer
    const existingObjectIndex = System.outBufferAllObjectsState.findIndex(obj => obj.object_id === object_id);

    if (existingObjectIndex !== -1) {
      // Update the existing object's position
      System.outBufferAllObjectsState[existingObjectIndex].position = { x: x, y: y };
    } else {
      // Add new object to the buffer
      System.outBufferAllObjectsState.push({
        object_id: object_id,
        position: { x: x, y: y }
      });
    }
  }

  static async writeAllObjects() {

    let payload = System.outBufferAllObjectsState.map(obj => ({
      key: obj.object_id,
      collection: "scene_objects",
      userId: "00000000-0000-0000-0000-000000000000",
      value: obj.position,
      permissionRead: 2,
      permissionWrite: 1,
    }));

    // Send the entire outBufferAllObjectsState to the server
    let response = await this.client.rpc(this.session, "manageobjects", payload);
    System.outBufferAllObjectsState = []; // Clear the buffer after sending

    // Write all objects to the server
    let recebido = await this.client.rpc(this.session, "manageobjects", payload);
    //console.log(recebido);
  }


  static async readAllObjects() {

    let payload = [
      {
        key: "empty",
        collection: "scene_objects",
        userId: "00000000-0000-0000-0000-000000000000",
        value: { "x": 0, "y": 0 },
        permissionRead: 2,
        permissionWrite: 1,
      }
    ]

    let response = await this.client.rpc(this.session, "manageobjects", payload);
    // //console.log(response);
    // let parsedResponse = JSON.parse(response);
    // //console.log(parsedResponse);

    System.allObjectsState = response.payload.objects;
    // //console.log(System.allObjectsState);
  }

  static async init() {
    this.client = new nakamajs.Client(
      serverConfig.nakamaKey,
      serverConfig.serverIp,
      serverConfig.serverPort
    );
    this.client.ssl = false;
    this.client.timeout = 10000;
    this.config = config;

    try {
      const { email, password, username } = serverConfig;
      // Authenticate with email and password
      this.session = await this.client.authenticateEmail(email, password);
      if (this.config.debug.verbose) {
        //console.log("Authenticated successfully:", this.session);
        //console.log("userId: ", this.session.user_id);
        //console.log("username: ", this.session.username);
        //console.log("email: ", email);
        //console.log("password: ", password);
      }
    } catch (error) {
      if (this.config.debug.verbose) //console.error("Authentication failed:", error);
        throw error;
    }

    this.socket = this.client.createSocket();
    await this.socket.connect(this.session, true);
    //console.log("Socket connected:", this.socket);

    gameStartTimestamp = Date.now();
    console.log("Game started at:", new Date(gameStartTimestamp).toLocaleString());
  }

  static async createUser() {
    try {
      const { email, password, username } = serverConfig;
      // Authenticate with email and password
      this.session = await this.client.authenticateEmail(email, password, 1, username);
      if (this.config.debug.verbose) {
        //console.log("Authenticated successfully:", this.session);
        //console.log("userId: ", this.session.user_id);
        //console.log("username: ", this.session.username);
        //console.log("email: ", email);
        //console.log("password: ", password);
      }
    } catch (error) {
      if (this.config.debug.verbose) //console.error("Authentication failed:", error);
        throw error;
    }

  }
}

export default System;