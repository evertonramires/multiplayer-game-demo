import Phaser from "phaser";
import System from "./system";

export default class RemotePlayer extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, texture, receivedUsername) {
    super(scene, x, y, texture);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setBounce(0);
    this.setCollideWorldBounds(true);
    this.nametag = scene.add.text(0, 0, receivedUsername, {
      fontSize: '16px',
      fill: '#fff',
      backgroundColor: 'rgba(0,0,0,0.5)',
      padding: { left: 4, right: 4, top: 2, bottom: 2 }
    });
    this.nametag.setOrigin(0.5, 1);
    this.createAnimations(scene);


  }

  createAnimations(scene) {
    if (!scene.anims.exists('left')) {
      scene.anims.create({
        key: 'left',
        frames: scene.anims.generateFrameNumbers('dude', { start: 3, end: 1 }),
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
        frames: scene.anims.generateFrameNumbers('dude', { start: 5, end: 7 }),
        frameRate: 10,
        repeat: -1
      });
    }
    if (!scene.anims.exists('up')) {
      scene.anims.create({
        key: 'up',
        frames: scene.anims.generateFrameNumbers('dude2', { start: 1, end: 3 }),
        frameRate: 10,
        repeat: -1
      });
    }
    if (!scene.anims.exists('down')) {
      scene.anims.create({
        key: 'down',
        frames: scene.anims.generateFrameNumbers('dude2', { start: 5, end: 7 }),
        frameRate: 10,
        repeat: -1
      });
    }
  }

  update() {
    if (!this.active) return;
    // Always update nametag position for all players
    this.updateNametag();
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
