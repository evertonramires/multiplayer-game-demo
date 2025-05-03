import "./style.css";
import Phaser from "phaser";
import System from "./entities/system";
import MainScene from "./scenes/mainScene";
import MainMenu from "./scenes/mainMenu";
import TestScene from "./scenes/testScene";

await System.init();

const game = new Phaser.Game({
  ...System.engineConfig,
  scene: [MainMenu, MainScene, TestScene]
});

if (await System.autoJoinFirstFoundMatch()) {
  // Start the MainScene after joining the match
  game.scene.start('MainScene');
  System.listMatchPlayers();
}