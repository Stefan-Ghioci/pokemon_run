var bootState = new Phaser.Class({
  Extends: Phaser.Scene,

  initialize: function Preload() {
    Phaser.Scene.call(this, { key: 'Preload' });
  },

  preload: function () {
    loadCharacterSpritesheet(this, 'eevee');
    loadCharacterSpritesheet(this, 'pikachu');

    this.load.image('world_background', '../assets/images/world_background.png');
    this.load.bitmapFont('pokemon_font', 'assets/fonts/pokemon.png', 'assets/fonts/pokemon.fnt');
  },

  create: function () {
    console.log('Preload');
    game.scene.start('MainMenu');
  },

  update: function () {},
});

state.scenes.push(bootState);

function loadCharacterSpritesheet(scene, character) {
  scene.load.spritesheet(
    character + '_cheer',
    '../assets/spritesheets/' + character + '/cheer.png',
    constants.frameSize
  );
  scene.load.spritesheet(character + '_run', '../assets/spritesheets/' + character + '/run.png', constants.frameSize);
  scene.load.spritesheet(character + '_idle', '../assets/spritesheets/' + character + '/idle.png', constants.frameSize);
}
