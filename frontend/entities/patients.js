import Phaser from "phaser";
import System from "./system";

export default class Patients extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture) {
        super(scene, x, y, 'paciente');
        scene.add.existing(this);
        scene.physics.add.existing(this);

        // Configurações físicas
        this.setCollideWorldBounds(true);
        this.setBounce(0.2);
        this.body.moves = false;
        this.setDrag(100);
        this.body.setSize(32, 70);   // Redimensiona a hitbox

        // Estado do objeto
        this.isBeingHeld = false;
        this.holder = null;

        //Send initial position to the server
        System.writeObject(this.object_id, this.x, this.y);
    }

    // Método para ser segurado por um jogador
    beHeldBy(player) {
        this.isBeingHeld = true;
        this.holder = player;
        this.setCollideWorldBounds(false);
        this.body.checkCollision.none = true; // Desativa colisões enquanto segurado
    }

    // Método para ser solto
    release() {
        this.isBeingHeld = false;
        this.holder = null;
        this.setCollideWorldBounds(true);
        this.body.checkCollision.none = false; // Reativa colisões
    }

    // Atualiza a posição se estiver sendo segurado
    update() {
        if (this.isBeingHeld && this.holder) {
            this.setPosition(
                this.holder.x,
                this.holder.y - this.holder.displayHeight / 2 - this.displayHeight / 2
            );
            this.body.setVelocity(0);

            // Send updated position to the server only if it is being held
            System.writeObject(this.object_id, this.x, this.y);

        }

        // Fetch the latest state of the object from the server
        const remoteObj = System.allObjectsState.find(o => o.key === this.object_id);

        if (remoteObj) {
            const { x: serverX, y: serverY } = remoteObj.value;

            // Check if the local position is significantly different from the server position
            const distance = Phaser.Math.Distance.Between(this.x, this.y, serverX, serverY);

            // If the difference is large (> 10 pixels), interpolate smoothly
            if (distance > 10) {
                // Smoothing factor (0.1 to 0.3 for gradual movement)
                const lerpFactor = 0.2;
                this.x = Phaser.Math.Linear(this.x, serverX, lerpFactor);
                this.y = Phaser.Math.Linear(this.y, serverY, lerpFactor);
            }
        }
    }
}