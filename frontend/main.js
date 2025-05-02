import "./style.css";
import Phaser from "phaser";
import System from "./entities/system";
import MainScene from "./scenes/mainScene";
import MainMenu from "./scenes/mainMenu";

await System.init();

const game = new Phaser.Game({
  ...System.engineConfig,
  scene: [MainMenu, MainScene]
});

if (await System.autoJoinFirstFoundMatch()) {
  // Start the MainScene after joining the match
  game.scene.start('MainScene');
  System.listMatchPlayers();
}
