import Phaser from "phaser";

export default class Star extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'star');
    scene.add.existing(this);  }

  collectStar(player, scene) {
    this.disableBody(true, true);
    player.score += 10;

  }
}
