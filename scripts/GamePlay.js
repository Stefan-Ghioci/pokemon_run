var gamePlayState = new Phaser.Class({
  // Define scene
  Extends: Phaser.Scene,

  initialize: function GamePlay() {
    Phaser.Scene.call(this, { key: 'GamePlay' });
  },

  preload: function () {},

  create: function () {
    console.log('GamePlay');
    this.add.image(320, 240, 'world_background');
  },

  update: function () {},
});

state.scenes.push(gamePlayState);
