import Phaser from "phaser";

export default class Star extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'star');
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
  }

  collectStar(player, scene) {
    this.disableBody(true, true);
    player.score += 10;
    // Respawn all stars if all are collected
    if (scene.stars.countActive(true) === 0) {
      scene.stars.children.iterate(function (child, idx) {
        child.enableBody(true, 12 + idx * 70, 0, true, true);
      });
      var x = (scene.localPlayer.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);
      var bomb = scene.bombs.create(x, 16, 'bomb');
      bomb.setBounce(1);
      bomb.setCollideWorldBounds(true);
      bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
      bomb.allowGravity = false;
    }
  }
}
