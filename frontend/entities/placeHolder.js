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
    // Busca o estado mais recente do objeto no servidor
    const remoteObj = System.allObjectsState.find(o => o.key === this.object_id);
    
    if (remoteObj) {
      const { x: serverX, y: serverY } = remoteObj.value;
  
      // Verifica se a posição local está muito diferente da posição do servidor
      const distance = Phaser.Math.Distance.Between(this.x, this.y, serverX, serverY);
      
      // Se a diferença for grande (> 10 pixels), interpola suavemente
      if (distance > 10) {
        // Fator de suavização (0.1 a 0.3 para movimento gradual)
        const lerpFactor = 0.2; 
        this.x = Phaser.Math.Linear(this.x, serverX, lerpFactor);
        this.y = Phaser.Math.Linear(this.y, serverY, lerpFactor);
      }
    }
  }

  collectStar(player, scene) {
    this.disableBody(true, true);
    player.score += 10;
  }
}
