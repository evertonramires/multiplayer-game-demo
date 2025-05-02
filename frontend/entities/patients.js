import Phaser from "phaser";

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
        
        // Estado do objeto
        this.isBeingHeld = false;
        this.holder = null;
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
        }
    }
}