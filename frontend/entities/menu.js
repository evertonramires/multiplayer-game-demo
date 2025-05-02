import Phaser from "phaser";
import System from "./system";

export default class Menu extends Phaser.GameObjects.Container {
  constructor(scene, x, y, onTryAgain) {
    super(scene, x, y);

    scene.add.existing(this);
    this.setVisible(false);
    const bg = scene.add.rectangle(0, 0, 400, 400, 0x000000, 0.8);
    const gameOverText = scene.add.text(0, -150, 'Menu', { fontSize: '48px', fill: '#fff' }).setOrigin(0.5);
    const tryAgainButton = scene.add.text(0, -80, 'New Game', { fontSize: '32px', fill: '#fff', backgroundColor: '#007bff', padding: { left: 20, right: 20, top: 10, bottom: 10 } })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });
    tryAgainButton.on('pointerdown', () => {
      if (onTryAgain) onTryAgain();
    });

    // New Match button
    const createMatchButton = scene.add.text(0, 0, 'Create New Match', { fontSize: '28px', fill: '#fff', backgroundColor: '#28a745', padding: { left: 20, right: 20, top: 10, bottom: 10 } })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });
    createMatchButton.on('pointerdown', async () => {
      await System.createNewMatch();
    });

    // Join Match button
    const joinMatchButton = scene.add.text(0, 80, 'Join Match', { fontSize: '28px', fill: '#fff', backgroundColor: '#ffc107', padding: { left: 20, right: 20, top: 10, bottom: 10 } })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });
    joinMatchButton.on('pointerdown', async () => {
      await System.joinMatch();
    });

    // Back to Main Menu button
    const backToMenuButton = scene.add.text(0, 160, 'Back to Main Menu', { fontSize: '28px', fill: '#fff', backgroundColor: '#dc3545', padding: { left: 20, right: 20, top: 10, bottom: 10 } })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });
    backToMenuButton.on('pointerdown', () => {
      scene.scene.start('MainMenu');
    });

    this.add([bg, gameOverText, tryAgainButton, createMatchButton, joinMatchButton, backToMenuButton]);

    // Keyboard event for ESC to toggle menu
    scene.input.keyboard.on('keydown-ESC', () => {
      this.setVisible(!this.visible);
    });
  }
}
