import Phaser from "phaser";

export default class Station extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, texture) {
    super(scene, x, y, texture);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setImmovable(true);
    this.setVisible(true);
    this.setAlpha(0.5);
    this.isOccupied = false;
  }

  canReceivePatient() {
    return !this.isOccupied;
  }

  receivePatient(patient) {
    this.isOccupied = true;
    patient.release();
    patient.setPosition(this.x, this.y);
    patient.body.moves = false;
    patient.setDepth(1);
  }
}
