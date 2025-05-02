import Phaser from "phaser";
import System from "../entities/system";

export default class MainMenu extends Phaser.Scene {
    constructor() {
        super({ key: 'MainMenu' });
    }

    create() {
        const { width, height } = this.sys.game.config;

        // Title
        this.add.text(width / 2, height / 2 - 120, 'Main Menu', {
            fontSize: '48px', fill: '#fff', fontStyle: 'bold', align: 'center'
        }).setOrigin(0.5);

        // Create New Match button
        const createBtn = this.add.text(width / 2, height / 2 - 20, 'Create New Match', {
            fontSize: '32px', fill: '#fff', backgroundColor: '#007bff', padding: { left: 30, right: 30, top: 10, bottom: 10 }
        })
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true });
        createBtn.on('pointerdown', async () => {
            // Call the createNewMatch function from System
            await System.createNewMatch();
            this.scene.start('MainScene', { action: 'create' });
        });

        // Join Existing Match button
        const joinBtn = this.add.text(width / 2, height / 2 + 60, 'Join Existing Match', {
            fontSize: '32px', fill: '#fff', backgroundColor: '#28a745', padding: { left: 30, right: 30, top: 10, bottom: 10 }
        })
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true });
        joinBtn.on('pointerdown', async () => {
            await System.joinMatch();
            this.scene.start('MainScene', { action: 'join' });
        });
    }
}
