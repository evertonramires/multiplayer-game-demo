import "../style.css";
import Phaser from "phaser";
import Player from "../entities/player";
import RemotePlayer from "../entities/remotePlayer";
import Star from "../entities/star";
import Bomb from "../entities/bomb";
import Menu from "../entities/menu";
import Hud from "../entities/hud";
import System from "../entities/system";
import Patients from "../entities/patients";
import PlaceHolder from "../entities/placeHolder";

export default class MainScene extends Phaser.Scene {

  constructor() {
    super({ key: 'MainScene' });
    this.configData = System.config;
    this.stars = null;
    this.bombs = null;
    this.gameOver = false;
    this.remotePlayersBody = [];
    this.remotePlayers = [];
    this.lastNetworkUpdate = 0;
    this.networkUpdateInterval = 100; // ms (envia atualizações a cada 100ms)
  }

  preload() {
    this.load.image('sky', 'assets/sky.png');
    this.load.image('hospital', 'assets/hospital.png');
    this.load.image('wall', 'assets/wall.png');
    this.load.image('star', 'assets/star.png');
    this.load.image('bomb', 'assets/bomb.png');
    this.load.image('paciente', 'assets/pacienteGrave.png');
    this.load.spritesheet('dude', 'assets/dude.png', { frameWidth: 32, frameHeight: 48 });
  }

  create() {
    // Add background image stretched to fill the entire canvas
    this.add.image(0, 0, 'hospital')
      .setOrigin(0, 0)
      .setDisplaySize(this.sys.game.config.width, this.sys.game.config.height);


    // Tamanho da tela (ajuste conforme sua config)
    const width = this.scale.width;
    const height = this.scale.height;
    const wallThickness = 32; // largura constante da parede
    const marginRight = 100;

    // GRUPO DE PAREDES
    this.walls = this.physics.add.staticGroup();

    // PAREDE SUPERIOR
    const topWall = this.physics.add.staticImage(0, wallThickness / 2, 'wall')
      .setOrigin(0, 0.5)
      .setDisplaySize(width - marginRight, wallThickness)
      .refreshBody();
    this.walls.add(topWall);

    // PAREDE INFERIOR
    const bottomWall = this.physics.add.staticImage(0, height - wallThickness / 2, 'wall')
      .setOrigin(0, 0.5)
      .setDisplaySize(width - marginRight, wallThickness)
      .refreshBody();
    this.walls.add(bottomWall);

    // PAREDE ESQUERDA
    const leftWall = this.physics.add.staticImage(wallThickness / 2, height / 2, 'wall')
      .setDisplaySize(wallThickness, height)
      .setOrigin(0.5)
      .refreshBody();
    this.walls.add(leftWall);

    // PAREDE DIREITA
    const rightWall = this.physics.add.staticImage(width - marginRight - wallThickness / 2, height / 2, 'wall')
      .setDisplaySize(wallThickness, height)
      .setOrigin(0.5)
      .refreshBody();
    this.walls.add(rightWall);

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

    //spawn 10 remote player bodies in a hidden place to be assigned to remote players if they join match
    this.remotePlayersBody = [];
    for (let i = 0; i < 10; i++) {
      const remotePlayerBody = new RemotePlayer(this, 200 + i * 40, 500, 'dude', `${i}`);
      this.remotePlayersBody.push(remotePlayerBody);
    }

    // Replace stars group creation with Star class usage
    this.stars = this.physics.add.group({
      classType: Star,
      maxSize: 12,
      runChildUpdate: false
    });
    for (let i = 0; i < 12; i++) {
      const star = this.stars.get(12 + i * 70, 0);
      if (star) {
        star.setActive(true);
        star.setVisible(true);
      }
    }

    this.bombs = this.physics.add.group({
      classType: Bomb,
      maxSize: 3,
      runChildUpdate: false
    });
    // Spawn 3 bombs at random positions
    for (let i = 0; i < 3; i++) {
      const x = Phaser.Math.Between(0, this.sys.game.config.width);
      const bomb = this.bombs.get(x, 16);
      if (bomb) {
        bomb.setActive(true);
        bomb.setVisible(true);
      }
    }

    // Spawn a placeholder object at a fixed position
    this.placeHolder = new PlaceHolder(this, 400, 300, 'placeholder_001');

    // HUD overlay
    this.hud = new Hud(this);
    // this.hud.setDepth(1000); // Ensure HUD is above all other game objects
    // this.hud.setVisible(true); // Explicitly show HUD

    // Set Player collider
    if (this.localPlayer) {
      this.localPlayer.setupColliders({
        stars: this.stars,
        bombs: this.bombs,
        scene: this
      });
    }

    // Ensure things collide
    this.physics.add.collider(this.walls, this.placeHolder);
    this.physics.add.collider(this.localPlayer, this.placeHolder);
    this.physics.add.collider(this.localPlayer, this.patients);
    this.physics.add.collider(this.localPlayer, this.walls);

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

  update(time) {
    if (this.gameOver) return;
    if (this.localPlayer) this.localPlayer.update();
    if (this.placeHolder) this.placeHolder.update();


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

    if (time - this.lastNetworkUpdate > this.networkUpdateInterval) {
      if (this.placeHolder.x !== this.placeHolder.lastX || 
          this.placeHolder.y !== this.placeHolder.lastY) {
        System.writeObject(
          this.placeHolder.object_id, 
          this.placeHolder.x, 
          this.placeHolder.y
        );
        this.placeHolder.lastX = this.placeHolder.x;
        this.placeHolder.lastY = this.placeHolder.y;
      }
      this.lastNetworkUpdate = time;
    }
  }

  hitBomb(player, bomb) {
    this.physics.pause();
    player.setTint(0xff0000);
    player.anims.play('turn');
    this.gameOver = true;
    this.menuScreen.setVisible(true);
  }
}