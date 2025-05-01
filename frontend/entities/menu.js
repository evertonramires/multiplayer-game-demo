import Phaser from "phaser";

export default class Menu extends Phaser.GameObjects.Container {
  constructor(scene, x, y, onTryAgain) {
    super(scene, x, y);
    scene.add.existing(this);
    this.setVisible(false);
    const bg = scene.add.rectangle(0, 0, 400, 200, 0x000000, 0.8);
    const gameOverText = scene.add.text(0, -40, 'Game Over', { fontSize: '48px', fill: '#fff' }).setOrigin(0.5);
    const tryAgainButton = scene.add.text(0, 40, 'Try Again', { fontSize: '32px', fill: '#fff', backgroundColor: '#007bff', padding: { left: 20, right: 20, top: 10, bottom: 10 } })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });
    tryAgainButton.on('pointerdown', () => {
      if (onTryAgain) onTryAgain();
    });
    this.add([bg, gameOverText, tryAgainButton]);
  }
}
