import Phaser from "phaser";

export default class Hud extends Phaser.GameObjects.Container {
  constructor(scene) {
    super(scene, 0, 0);
    scene.add.existing(this);
    this.setScrollFactor(0);

    // Player list text centered on screen
    this.playerListText = scene.add.text(
      scene.sys.game.config.width / 2,
      scene.sys.game.config.height / 2,
      '',
      { fontSize: '32px', fill: '#fff', align: 'center' }
    ).setOrigin(0.5);
    this.add(this.playerListText);
  }

  updatePlayerList(match) {
    if (!match || !match.presences || match.presences.length === 0) {
      this.playerListText.setText('No players connected.');
      return;
    }
    let playerList = `Players Connected (${match.presences.length}):`;
    match.presences.forEach((presence, idx) => {
      playerList += `\n${idx + 1}. ${presence.username || presence.user_id}`;
    });
    this.playerListText.setText(playerList);
  }
}
