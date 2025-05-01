import Phaser from "phaser";

export default class Menu extends Phaser.GameObjects.Container {
  constructor(scene, x, y, onTryAgain) {
    super(scene, x, y);
    scene.add.existing(this);
    this.setVisible(false);
    const bg = scene.add.rectangle(0, 0, 400, 200, 0x000000, 0.8);
    const gameOverText = scene.add.text(0, -40, 'Menu', { fontSize: '48px', fill: '#fff' }).setOrigin(0.5);
    const tryAgainButton = scene.add.text(0, 40, 'New Game', { fontSize: '32px', fill: '#fff', backgroundColor: '#007bff', padding: { left: 20, right: 20, top: 10, bottom: 10 } })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });
    tryAgainButton.on('pointerdown', () => {
      if (onTryAgain) onTryAgain();
    });

    // New Match button
    const createMatchButton = scene.add.text(0, 100, 'Create New Match', { fontSize: '28px', fill: '#fff', backgroundColor: '#28a745', padding: { left: 20, right: 20, top: 10, bottom: 10 } })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });
    createMatchButton.on('pointerdown', async () => {
      await this.createNewMatch(scene);
    });

    // Join Match button
    const joinMatchButton = scene.add.text(0, 160, 'Join Match', { fontSize: '28px', fill: '#fff', backgroundColor: '#ffc107', padding: { left: 20, right: 20, top: 10, bottom: 10 } })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });
    joinMatchButton.on('pointerdown', async () => {
      const matchId = prompt('Enter Match ID to join:');
      console.log('Entered Match ID:', matchId);
      if (matchId && scene.nakamaService && scene.nakamaService.socket) {
        try {
          const match = await scene.nakamaService.socket.joinMatch(matchId);
          console.log('Joined match:', match);
        } catch (error) {
          console.error('Failed to join match:', error);
        }
      }
    });

    this.add([bg, gameOverText, tryAgainButton, createMatchButton, joinMatchButton]);

    // Keyboard event for ESC to toggle menu
    scene.input.keyboard.on('keydown-ESC', () => {
      this.setVisible(!this.visible);
    });
  }

  async createNewMatch(scene) {
    if (scene.nakamaService && scene.nakamaService.socket) {
      try {
        const matchName = "NoImpostersAllowed";
        const match = await scene.nakamaService.socket.createMatch(matchName);
        console.log("Match created:", match);
      } catch (error) {
        console.error("Failed to create match:", error);
      }
    }
  }
}
