var bootState = new Phaser.Class({
  Extends: Phaser.Scene,

  initialize: function Preload() {
    Phaser.Scene.call(this, { key: 'Preload' });
  },

  preload: function () {
    loadCharacterSpritesheet(this, 'eevee');
    loadCharacterSpritesheet(this, 'pikachu');

    this.load.spritesheet('flag', '../assets/spritesheets/flag.png', constants.frameSize);

    this.load.image('world_top_background', '../assets/images/world_top_background.png');
    this.load.image('world_bottom_background', '../assets/images/world_bottom_background.png');
    this.load.image('menu_background', '../assets/images/menu_background.png');

    this.load.image('bush0', '../assets/images/bush0.png');
    this.load.image('bush1', '../assets/images/bush1.png');

    this.load.bitmapFont('pokemon_font', 'assets/fonts/pokemon.png', 'assets/fonts/pokemon.fnt');
  },

  create: function () {
    console.log('Preload');
    
    
    createCharacterAnims(this, 'eevee');
    createCharacterAnims(this, 'pikachu');

    this.anims.create({
      key: 'flag',
      frames: this.anims.generateFrameNumbers('flag'),
      frameRate: 6,
      repeat: -1,
    });

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

function createCharacterAnims(scene, character) {
  scene.anims.create({
    key: character + '_idle',
    frames: scene.anims.generateFrameNumbers(character + '_idle'),
    frameRate: 6,
    repeat: -1,
  });

  scene.anims.create({
    key: character + '_cheer',
    frames: scene.anims.generateFrameNumbers(character + '_cheer'),
    frameRate: 6,
    repeat: -1,
  });

  scene.anims.create({
    key: character + '_run',
    frames: scene.anims.generateFrameNumbers(character + '_run'),
    frameRate: 10,
    repeat: -1,
  });
}
