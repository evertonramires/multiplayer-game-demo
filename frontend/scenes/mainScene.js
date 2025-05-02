import "../style.css";
import Phaser from "phaser";
import Player from "../entities/player";
import Star from "../entities/star";
import Bomb from "../entities/bomb";
import Menu from "../entities/menu";
import Hud from "../entities/hud";
import System from "../entities/system";
import Patients from "../entities/patients";
import PlayerInMatch from "../entities/match";

export default class MainScene extends Phaser.Scene {

  constructor() {
    super({ key: 'MainScene' });
    this.configData = System.config;
    this.stars = null;
    this.bombs = null;
    this.platforms = null;
    this.gameOver = false;
  }

    preload() {
      this.load.image('sky', 'assets/sky.png');
      this.load.image('hospital', 'assets/hospital.png');
      this.load.image('ground', 'assets/platform.png');
      this.load.image('star', 'assets/star.png');
      this.load.image('bomb', 'assets/bomb.png');
      this.load.image('paciente', 'assets/pacienteGrave.png');
      this.load.spritesheet('dude', 'assets/dude.png', { frameWidth: 32, frameHeight: 48 });
      this.load.spritesheet('nurse', 'assets/nurse.png', { frameWidth: 1, frameHeight: 1 });
    }

  create() {
    // Add background image stretched to fill the entire canvas
    this.add.image(0, 0, 'hospital')
      .setOrigin(0, 0)
      .setDisplaySize(this.sys.game.config.width, this.sys.game.config.height);

    this.platforms = this.physics.add.staticGroup();
    this.platforms.create(400, 568, 'ground').setScale(2).refreshBody();
    this.platforms.create(600, 400, 'ground');
    this.platforms.create(50, 250, 'ground');
    this.platforms.create(750, 220, 'ground');

    // Create a ground platform at the bottom of the canvas
    const ground = this.platforms.create(System.config.canvas.width / 2, System.config.canvas.height - 30, 'ground').setScale(5).refreshBody();
    ground.setTintFill(0x808080); // grey tint

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

    // HUD overlay
    this.hud = new Hud(this);
    // this.hud.setDepth(1000); // Ensure HUD is above all other game objects
    // this.hud.setVisible(true); // Explicitly show HUD

    // Set Player collider
    if (this.localPlayer) {
      this.localPlayer.setupColliders({
        platforms: this.platforms,
        stars: this.stars,
        bombs: this.bombs,
        scene: this
      });
    }

    // Ensure stars and bombs collide with platforms
    this.physics.add.collider(this.stars, this.platforms);
    this.physics.add.collider(this.bombs, this.platforms);
    this.physics.add.collider(this.patients, this.platforms);
    this.physics.add.collider(this.localPlayer, this.patients);


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
          System.playersList.map(element => element).join('\n')
        );
      }
    }




    
    var state = new PlayerInMatch;
    state.playerId = System.session.user_id;
    state.playerName = System.session.username;
    state.playerX = this.localPlayer.x;
    state.playerY = this.localPlayer.y;
    
    System.syncMatchStatus(state);

  }

  hitBomb(player, bomb) {
    this.physics.pause();
    player.setTint(0xff0000);
    player.anims.play('turn');
    this.gameOver = true;
    this.menuScreen.setVisible(true);
  }
}