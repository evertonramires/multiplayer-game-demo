import Phaser from "phaser";
import * as nakamajs from "@heroiclabs/nakama-js";
import config from "../config.json";
import serverConfig from "../serverConfig.json";


class System {

  static match = null;
  static client = null;
  static socket = null;
  static session = null;
  static config = config;

  static engineConfig = {
    type: Phaser.WEBGL,
    width: System.config.canvas.width - System.config.canvas.margin * 2,
    height: System.config.canvas.height - System.config.canvas.margin * 2,
    canvas: gameCanvas,
    physics: {
      default: "arcade",
      arcade: {
        gravity: { y: System.config.physics.gravity },
        debug: System.config.showColiders,
      },
    }
  };

  static async createNewMatch() {
    try {
      const matchName = "NoImpostersAllowed";
      System.match = await this.socket.createMatch(matchName);
      console.log("Match created:", System.match);
    } catch (error) {
      console.error("Failed to create match:", error);
    }
  }

  static async joinMatch() {
    const matchId = prompt('Enter Match ID to join:');
    console.log('Entered Match ID:', matchId);
if (matchId) {
    console.log("there is a matchId: " + matchId);
    try {
      System.match = await this.socket.joinMatch(matchId);
      console.log('Joined match:', System.match);
      return true;
    } catch (error) {
      console.error('Failed to join match:', error);
      window.alert('Failed to join match. Please check the Match ID and try again.');
      return false;
    }
  }
  else {
    console.log("No matchId provided.");
    // window.alert('No Match ID provided. Please enter a valid Match ID.');
    return false;
  }
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
      const { email, password, username } = this.config.debug;
      // Authenticate with email and password
      this.session = await this.client.authenticateEmail(email, password);
      if (this.config.debug.verbose) {
        console.log("Authenticated successfully:", this.session);
        console.log("userId: ", this.session.user_id);
        console.log("username: ", this.session.username);
        console.log("email: ", email);
        console.log("password: ", password);
      }
    } catch (error) {
      if (this.config.debug.verbose) console.error("Authentication failed:", error);
      throw error;
    }

    this.socket = this.client.createSocket();
    await this.socket.connect(this.session, true);
  }
}

export default System;
