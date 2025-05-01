import "./style.css";
import Phaser from "phaser";
import * as nakamajs from "@heroiclabs/nakama-js";
import config from "./config.json";
import serverConfig from "./serverConfig.json";
import Player from "./entities/player";
import Star from "./entities/star";
import Bomb from "./entities/bomb";
import Menu from "./entities/menu";

class NakamaService {
  constructor(config) {
    this.client = new nakamajs.Client(
      serverConfig.nakamaKey,
      serverConfig.serverIp,
      serverConfig.serverPort
    );
    this.client.ssl = false;
    this.client.timeout = 10000;
    this.session = null;
    this.socket = null;
    this.config = config;
  }

  async authenticate() {
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
      return this.session;
    } catch (error) {
      if (this.config.debug.verbose) console.error("Authentication failed:", error);
      throw error;
    }
  }

  async connectSocket() {
    this.socket = this.client.createSocket();
    await this.socket.connect(this.session, true);
    return this.socket;
  }
}

class MainScene extends Phaser.Scene {
  constructor(nakamaService, config) {
    super({ key: 'MainScene' });
    this.nakamaService = nakamaService;
    this.configData = config;
    this.players = {};
    this.stars = null;
    this.bombs = null;
    this.platforms = null;
    this.score = 0;
    this.gameOver = false;
    this.scoreText = null;
  }

  preload() {
    this.load.image('sky', 'assets/sky.png');
    this.load.image('ground', 'assets/platform.png');
    this.load.image('star', 'assets/star.png');
    this.load.image('bomb', 'assets/bomb.png');
    this.load.spritesheet('dude', 'assets/dude.png', { frameWidth: 32, frameHeight: 48 });
  }

  create() {
    // Add background image stretched to fill the entire canvas
    this.add.image(0, 0, 'sky')
      .setOrigin(0, 0)
      .setDisplaySize(this.sys.game.config.width, this.sys.game.config.height);

    this.platforms = this.physics.add.staticGroup();
    this.platforms.create(400, 568, 'ground').setScale(2).refreshBody();
    this.platforms.create(600, 400, 'ground');
    this.platforms.create(50, 250, 'ground');
    this.platforms.create(750, 220, 'ground');

    // Create a ground platform at the bottom of the canvas
    const ground = this.platforms.create(config.canvas.width / 2, config.canvas.height - 30, 'ground').setScale(5).refreshBody();
    ground.setTintFill(0x808080); // grey tint

    // Create players
    const localUserId = this.nakamaService.session.user_id;
    this.players[localUserId] = new Player(this, 100, 450, 'dude', this.nakamaService.session.username, true);
    this.localPlayer = this.players[localUserId];

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

    this.scoreText = this.add.text(16, 16, '', { fontSize: '32px', fill: '#000' });

    // Colliders for all players
    Object.values(this.players).forEach(player => {
      player.setupColliders({
        platforms: this.platforms,
        stars: this.stars,
        bombs: this.bombs,
        scene: this
      });
    });

    // Ensure stars and bombs collide with platforms
    this.physics.add.collider(this.stars, this.platforms);
    this.physics.add.collider(this.bombs, this.platforms);




    // Calls Menu when player dies
    this.gameOverScreen = new Menu(
      this,
      this.sys.game.config.width / 2,
      this.sys.game.config.height / 2,
      () => {
        this.gameOver = false;
        this.scene.restart();
      }
    );
    this.gameOverScreen.setVisible(false);
  }

  update() {
    if (this.gameOver) return;
    if (this.localPlayer) this.localPlayer.update();
    // Build a scoreboard string with all players
    if (this.scoreText) {
      let scoreboard = '';
      const playerList = Object.values(this.players);
      playerList.forEach((player, idx) => {
        scoreboard += `${player.nametag.text}: ${player.score}`;
        if (idx < playerList.length - 1) scoreboard += '\n';
      });
      this.scoreText.setText(scoreboard);
    }
  }

  hitBomb(player, bomb) {
    this.physics.pause();
    player.setTint(0xff0000);
    player.anims.play('turn');
    this.gameOver = true;
    this.gameOverScreen.setVisible(true);
  }
}

async function startGame() {
  const nakamaService = new NakamaService(config);
  await nakamaService.authenticate();
  await nakamaService.connectSocket();
  const gameConfig = {
    type: Phaser.WEBGL,
    width: config.canvas.width - config.canvas.margin * 2,
    height: config.canvas.height - config.canvas.margin * 2,
    canvas: gameCanvas,
    physics: {
      default: "arcade",
      arcade: {
        gravity: { y: config.physics.gravity },
        debug: config.showColiders,
      },
    },
    scene: new MainScene(nakamaService, config)
  };
  new Phaser.Game(gameConfig);
}

startGame();