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
    this.setBounce(1); // Add bounce effect
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
    // Fetch the latest state of the object from the server
    const remoteObj = System.allObjectsState.find(o => o.key === this.object_id);
    
    if (remoteObj) {
      const { x: serverX, y: serverY } = remoteObj.value;
  
      // Check if the local position is significantly different from the server position
      const distance = Phaser.Math.Distance.Between(this.x, this.y, serverX, serverY);
      
      // If the difference is large (> 10 pixels), interpolate smoothly
      if (distance > 10) {
        // Smoothing factor (0.1 to 0.3 for gradual movement)
        const lerpFactor = 0.2; 
        this.x = Phaser.Math.Linear(this.x, serverX, lerpFactor);
        this.y = Phaser.Math.Linear(this.y, serverY, lerpFactor);
      }
    }
  }
}
