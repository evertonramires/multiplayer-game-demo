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
      { fontSize: '30px', fill: '#ff0', fontStyle: 'bold'}
    )
    this.add(this.debugOverlay);
  }
}
