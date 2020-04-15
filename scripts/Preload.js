var preloadState = new Phaser.Class({
  Extends: Phaser.Scene,
  
  initialize: function Preload() {
    Phaser.Scene.call(this, { key: 'Preload' });
  },

  preload: function () {
  },

  create: function () {
    console.log('Preload');
    game.scene.start('MainMenu');
  },
  
  update: function () {},
});

global.scenes.push(preloadState);
