import Phaser from "phaser";

export default class Bomb extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'bomb');
    scene.add.existing(this);
  }
}
