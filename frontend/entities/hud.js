import Phaser from "phaser";
import System from "./system";

export default class Hud extends Phaser.GameObjects.Container {
  constructor(scene) {
    super(scene, 0, 0);
    scene.add.existing(this);
    this.setScrollFactor(0);

    // Always show sample text at the exact center
    this.debugOverlay = scene.add.text(
      50,
      50,
      'No data',
      { fontSize: '15px', fill: '#ff0000', fontStyle: 'bold' }
    )
    this.add(this.debugOverlay);
  }

  update() {
    if (!this.active) return;
    // Update the debug overlay with the current player data
    this.debugOverlay.setText(`Player: ${System.session.username}\nMatch ID: ${System.session.matchId}`);
  }

}
