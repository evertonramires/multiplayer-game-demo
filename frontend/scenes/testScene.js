import "../style.css";
import Phaser from "phaser";
import Player from "../entities/player";
import RemotePlayer from "../entities/remotePlayer";
import Menu from "../entities/menu";
import Hud from "../entities/hud";
import System from "../entities/system";
import Patients from "../entities/patients";
import Station from "../entities/station";

export default class TestScene extends Phaser.Scene {

  constructor() {
    super({ key: 'TestScene' });
    this.configData = System.config;
    this.gameOver = false;
    this.remotePlayersBody = [];
    this.remotePlayers = [];
  }

  preload() {
    this.load.image('paciente', 'assets/pacienteGrave.png');
    this.load.spritesheet('dude', 'assets/doctor_sides.png', { frameWidth: 32, frameHeight: 48 });
    this.load.spritesheet('dude2', 'assets/doctor_updown.png', { frameWidth: 32, frameHeight: 48 });

    this.load.tilemapTiledJSON("mapa", "assets/mapas/mapajson.json");
    this.load.image("tileset1", "assets/mapas/walls_floor.png");
    this.load.image("tileset2", "assets/mapas/fire_animation2.png");
    this.load.image("tileset3", "assets/mapas/decorative_cracks_floor.png");
    this.load.image("tileset4", "assets/mapas/pedestals.png");
  }

  create() {
    // const width = this.scale.width;
    // const height = this.scale.height;

    // Cria o mapa
    const map = this.make.tilemap({ key: "mapa" });
    const tilesetWalls = map.addTilesetImage("walls_floor", "tileset1");
    const tilesetFire = map.addTilesetImage("fire_animation2", "tileset2");
    const tilesetDeco = map.addTilesetImage("cracked_tiles_floor", "tileset3");
    const tilesetStation = map.addTilesetImage("pedestals", "tileset4");

    // Camadas
    const floorLayer = map.createLayer("Floor", tilesetWalls, 0, 0).setDisplaySize(this.sys.game.config.width, this.sys.game.config.height);
    const collisionLayer = map.createLayer("Walls", [tilesetWalls, tilesetDeco], 0, 0).setDisplaySize(this.sys.game.config.width, this.sys.game.config.height);
    const fireLayer = map.createLayer("Decos", [tilesetFire], 0, 0).setDisplaySize(this.sys.game.config.width, this.sys.game.config.height);
    const stationLayer = map.createLayer("Station", [tilesetStation], 0, 0).setDisplaySize(this.sys.game.config.width, this.sys.game.config.height);

    // Adiciona colisão às paredes
    collisionLayer.setCollisionByProperty({ collides: true });

    //Station
    this.stationTiles = [];

    this.stations = this.physics.add.group({
      classType: Station,
      runChildUpdate: true
    });

    if (stationLayer) {
      stationLayer.forEachTile(tile => {
        if (tile.properties?.station) {
          const worldX = tile.getCenterX();
          const worldY = tile.getCenterY();
          const station = new Station(this, worldX, worldY);
          this.stations.add(station);
        }
      });
    }
    
    // Patients
    this.patients = this.physics.add.group({
      classType: Patients,
      maxSize: 5,
      runChildUpdate: true
    });

    for (let i = 0; i < 3; i++) {
      const x = Phaser.Math.Between(100, 700);
      const y = Phaser.Math.Between(100, 400);
      const obj = this.patients.get(x, y, 'paciente');
      if (obj) {
        obj.setActive(true);
        obj.setVisible(true);
        obj.setScale(0.5);
      }
    }

    this.localPlayer = new Player(this, 100, 500, 'dude');
    // this.localPlayer.setDepth(10);

    //spawn 10 remote player bodies in a hidden place to be assigned to remote players if they join match
    this.remotePlayersBody = [];
    for (let i = 0; i < 10; i++) {
      const remotePlayerBody = new RemotePlayer(this, 200 + i * 40, 500, 'dude', `${i}`);
      this.remotePlayersBody.push(remotePlayerBody);
    }

    // HUD overlay
    this.hud = new Hud(this);
    // this.hud.setDepth(1000); // Ensure HUD is above all other game objects
    // this.hud.setVisible(true); // Explicitly show HUD

    // Set Player collider
    if (this.localPlayer) {
      this.localPlayer.setupColliders({
        scene: this
      });
    }

    // Ensure things collide
    this.physics.add.collider(this.localPlayer, this.patients);
    this.physics.add.collider(this.localPlayer, collisionLayer);

    // Calls Menu when player dies
    this.menuScreen = new Menu(
      this,
      this.sys.game.config.width / 2,
      this.sys.game.config.height / 2,
      () => {
        this.gameOver = false;
        this.scene.restart();
      }
    );
    this.menuScreen.setVisible(false);


  }

  async update() {
    if (this.gameOver) return;
    if (this.localPlayer) this.localPlayer.update();


    // Update remote players based on System.playersState
    System.playersState.forEach((remotePlayerState, idx) => {
      // Skip local player
      if (remotePlayerState.playerId === System.session.user_id) return;

      // Assign a remotePlayer sprite for each remote player state
       let remo = this.remotePlayersBody[idx];
      if (remo) {
        remo.x = remotePlayerState.playerX;
        remo.y = remotePlayerState.playerY;
        remo.nametag.setText(remotePlayerState.playerName || "Remote");
        remo.setVisible(true);
        remo.setActive(true);
        remo.update();
      }
    });

    // Hide unused remotePlayers if there are fewer remote players than sprites
    for (let i = System.playersState.length; i < this.remotePlayersBody.length; i++) {
      this.remotePlayersBody[i].setVisible(false);
      this.remotePlayersBody[i].setActive(false);
    }

    this.patients.children.iterate(patient => {
      if (patient && patient.update) patient.update();
    });

    // Update HUD overlay with latest match and player info
    if (System.match) {
      if (this.hud && this.hud.debugOverlay) {
        this.hud.debugOverlay.setText(
          'Match ID: ' + System.match.match_id + '\n' +
          '---------------------- \n' +
          'Online Players: ' + System.match.size + '\n' +
          '---------------------- \n' +
          System.playersState
            .map(element => element.playerName + ": (" + Math.trunc(element.playerX) + "," + Math.trunc(element.playerY) + ")")
            .join('\n')
        );
      }
    }


    // Send local player state to the server
    var localState = {};
    localState.playerId = System.session.user_id;
    localState.playerName = System.session.username;
    localState.playerX = this.localPlayer.x;
    localState.playerY = this.localPlayer.y;
    System.syncMatchStatus(localState);

  }
}