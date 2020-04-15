var mainMenuState = new Phaser.Class({
  Extends: Phaser.Scene,

  initialize: function MainMenu() {
    Phaser.Scene.call(this, { key: 'MainMenu' });
  },

  preload: function () {},

  create: function () {
    console.log('MainMenu');

    this.add.bitmapText(40, 40, 'pokemon_font', 'Choose your Pokemon', 53);

    this.pikachu = this.add.sprite(160, 220, 'pikachu_idle').setScale(3).setInteractive({ useHandCursor: true });
    this.eevee = this.add.sprite(480, 220, 'eevee_idle').setScale(3).setInteractive({ useHandCursor: true });
    this.eevee.flipX = 1;

    this.pikachu.alpha = 0.5;
    this.eevee.alpha = 0.5;

    this.anims.create({
      key: 'pikachu_idle',
      frames: this.anims.generateFrameNumbers('pikachu_idle'),
      frameRate: 6,
      repeat: -1,
    });

    this.anims.create({
      key: 'eevee_idle',
      frames: this.anims.generateFrameNumbers('eevee_idle'),
      frameRate: 6,
      repeat: -1,
    });

    this.pikachu.anims.load('pikachu_idle');
    this.eevee.anims.load('eevee_idle');

    characters = [this.pikachu, this.eevee];

    bindCharacterSelectHandler(this.pikachu, 0);
    bindCharacterSelectHandler(this.eevee, 1);

    this.input.setPollAlways();

    this.input.on('gameobjectover', function (_pointer, object) {
      if (characters.includes(object)) {
        unfreeze(object);
      }
    });
    this.input.on('gameobjectout', function (_pointer, object) {
      if (characters.includes(object)) {
        if (state.selectedCharacter === -1 || characters[state.selectedCharacter] !== object) freeze(object);
      }
    });

    this.go = this.add.bitmapText(240, 360, 'pokemon_font', 'PLAY!', 53);
    this.go.alpha = 0.5;
    this.go.on(
      'pointerdown',
      function () {
        this.scene.start('GamePlay');
      },
      this
    );
  },

  update: function () {
    if (state.selectedCharacter !== -1) {
      this.go.alpha = 1;
      this.go.setInteractive({ useHandCursor: true });
    }
  },
});

state.scenes.push(mainMenuState);

function unfreeze(object) {
  object.anims.isPaused ? object.anims.resume() : object.anims.play(object.anims.currentAnim);
  object.alpha = 1;
}

function freeze(object) {
  if (object.anims.isPlaying) object.anims.pause();
  object.alpha = 0.5;
}

function bindCharacterSelectHandler(character, index) {
  character.on('pointerdown', function () {
    state.selectedCharacter = index;
    freeze(characters[1 - index]);
    characters[1 - index].setInteractive({ useHandCursor: true });
    character.removeInteractive();
  });
}
