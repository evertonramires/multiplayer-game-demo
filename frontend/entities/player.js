import Phaser from "phaser";
import System from "./system";

export default class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, texture) {
    super(scene, x, y, texture);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setBounce(0);
    this.setCollideWorldBounds(true);

    this.body.setSize(30, 40);         // reduz a hitbox para 20px de altura
    this.body.setOffset(0, 10);        // 48 - 20 = 28 → desloca a hitbox para o fundo

    this.nametag = scene.add.text(0, 0, System.session.username, {
      fontSize: '16px',
      fill: '#fff',
      backgroundColor: 'rgba(0,0,0,0.5)',
      padding: { left: 4, right: 4, top: 2, bottom: 2 }
    });
    this.nametag.setOrigin(0.5, 1);
    this.createAnimations(scene);
    this.cursors = scene.input.keyboard.createCursorKeys();
    this.keys = scene.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D
    });    

    this.patients = scene.patients; // Grupo de objetos seguráveis
    this.heldObject = null; // Objeto atualmente segurado
    this.interactKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E); // Tecla para interagir

  }

  createAnimations(scene) {
    if (!scene.anims.exists('left')) {
      scene.anims.create({
        key: 'left',
        frames: scene.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1
      });
    }
    if (!scene.anims.exists('turn')) {
      scene.anims.create({
        key: 'turn',
        frames: [{ key: 'dude', frame: 4 }],
        frameRate: 20
      });
    }
    if (!scene.anims.exists('right')) {
      scene.anims.create({
        key: 'right',
        frames: scene.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
        frameRate: 10,
        repeat: -1
      });
    }
  }

  tryInteract() {
    if (this.heldObject) {
        // Solta o objeto se já estiver segurando algo
        this.heldObject.release();
        this.heldObject = null;
    } else {
        // Procura por objetos seguráveis próximos
        this.patients.getChildren().forEach(obj => {
            if (Phaser.Math.Distance.Between(this.x, this.y, obj.x, obj.y) < 50) {
                this.heldObject = obj;
                obj.beHeldBy(this);
                return;
            }
        });
    }
}

  update() {
    if (!this.active) return;
    // Always update nametag position for all players
    this.updateNametag();
    // Only local player handles input
    if (this.cursors) {

      let velocityX = 0;
      let velocityY = 0;

      if (this.cursors.left.isDown || this.keys.left.isDown) {
        velocityX = -160;
      } else if (this.cursors.right.isDown || this.keys.right.isDown) {
        velocityX = 160;
      }

      if (this.cursors.up.isDown || this.keys.up.isDown) {
        velocityY = -160;
      } else if (this.cursors.down.isDown || this.keys.down.isDown) {
        velocityY = 160;
      }

      this.setVelocityX(velocityX);
      this.setVelocityY(velocityY);

      if (velocityX < 0) {
        this.anims.play('left', true);
      } else if (velocityX > 0) {
        this.anims.play('right', true);
      } else if (velocityY < 0) {
        this.anims.play('up', true);
      } else if (velocityY > 0) {
        this.anims.play('down', true);
      } else {
        this.anims.play('turn');
      }
    }
    
    if (Phaser.Input.Keyboard.JustDown(this.interactKey)) {
      this.tryInteract();
    }
  }

  updateNametag() {
    this.nametag.x = this.x;
    this.nametag.y = this.y - this.displayHeight / 2 - 8;
  }

  destroy(fromScene) {
    this.nametag.destroy();
    super.destroy(fromScene);
  }

  setupColliders({ platforms, stars, bombs, scene }) {
    scene.physics.add.collider(this, platforms);
    scene.physics.add.collider(this, bombs, scene.hitBomb, null, scene);
    // All players should be able to collect stars
    scene.physics.add.overlap(this, stars, (player, star) => {
      star.collectStar(player, scene);
    }, null, scene);
  }
}
