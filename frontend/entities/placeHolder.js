import Phaser from "phaser";
import System from "./system";

export default class PlaceHolder extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, object_id) {
    super(scene, x, y, 'star');
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setCollideWorldBounds(true);
    this.setActive(true);
    this.setVisible(true);
    this.setScale(1);
    this.object_id = object_id;
    this.lastX = x;
    this.lastY = y;
    System.writeObject(this.object_id, this.x, this.y);
  }

  preUpdate(time, delta) {
    super.preUpdate(time, delta);

    // Check if position changed
    if (this.x !== this.lastX || this.y !== this.lastY) {
      System.writeObject(this.object_id, this.x, this.y);
      this.lastX = this.x;
      this.lastY = this.y;
    }
  }

  update() {
    try {
      if (System.allObjectsState && System.allObjectsState[this.object_id]) {
      this.y = System.allObjectsState[this.object_id].y;
      }
    } catch (e) {
      // Optionally log or handle error
    }
  }

  collectStar(player, scene) {
    this.disableBody(true, true);
    player.score += 10;
  }
}
