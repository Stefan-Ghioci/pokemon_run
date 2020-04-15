var mainMenuState = new Phaser.Class({
  Extends: Phaser.Scene,

  initialize: function MainMenu() {
    Phaser.Scene.call(this, { key: 'MainMenu' });
  },

  preload: function () {},

  create: function () {
    console.log('MainMenu');
    game.scene.start('GamePlay');
  },

  update: function () {},
});

global.scenes.push(mainMenuState);
