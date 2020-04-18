var gamePlayState = new Phaser.Class({
  // Define scene
  Extends: Phaser.Scene,

  initialize: function GamePlay() {
    Phaser.Scene.call(this, { key: 'GamePlay' });
  },

  preload: function () {},

  create: function () {
    console.log('GamePlay');

    this.physics.world.setBounds(0, 220, 480, 160);
    this.physics.world.setBoundsCollision(true, false, true, true);

    this.topBackground = this.add.tileSprite(0, 0, 640, 480, 'world_top_background');
    this.topBackground.setOrigin(0);
    this.topBackground.setScrollFactor(0);

    this.bottomBackground = this.add.tileSprite(0, 0, 640, 480, 'world_bottom_background');
    this.bottomBackground.setOrigin(0);
    this.bottomBackground.setScrollFactor(0);

    this.player = spawnCharacter(this, state.playerIndex);

    this.cursors = this.input.keyboard.createCursorKeys();

    this.cam = this.cameras.main;
    this.cam.setBounds(0, 0, 6400, 480);
    this.cam.startFollow(this.player);

    this.waiting = this.add.bitmapText(
      320,
      30,
      'pokemon_font',
      'Waiting for ' + (state.playerIndex === 0 ? 'Eevee' : 'Pikachu') + '...',
      40
    );
    this.waiting.setOrigin(0.5);

    this.flashWait1 = this.time.addEvent({
      delay: 1000,
      callback: () => {
        this.waiting.alpha = 1;
      },
      loop: true,
    });

    this.flashWait2 = this.time.addEvent({
      delay: 2000,
      callback: () => {
        this.waiting.alpha = 0;
      },
      loop: true,
    });

    // CONNECTIVITY

    this.socket = io();
    this.socket.emit('lfg', state.playerIndex);

    this.socket.on('game found', (seed) => {
      this.bushes = drawBushes(this, seed);

      this.opponent = spawnCharacter(this, 1 - state.playerIndex);
      this.physics.add.collider(this.opponent, this.player);

      state.gamePhase = 'playing';

      this.flashWait1.remove();
      this.flashWait2.remove();

      this.waiting.destroy();
    });

    this.socket.on('player moved', (cursors) => moveCharacter(this, this.player, state.playerIndex, cursors));

    this.socket.on('opponent moved', (cursors) => moveCharacter(this, this.opponent, 1 - state.playerIndex, cursors));

    this.socket.on('autowin', () => {
      state.gamePhase = 'winning';

      this.opponent.destroy();

      this.add
        .bitmapText(
          320,
          30,
          'pokemon_font',
          '' + (state.playerIndex === 0 ? 'Eevee' : 'Pikachu') + ' resigned. You win!',
          40
        )
        .setOrigin(0.5);

      this.time.addEvent({
        delay: 5000,
        callback: () => {
          this.socket.emit('disconnect', null);
          this.scene.start('MainMenu');
          state.gamePhase = 'waiting';
        },
        loop: true,
      });
    });
  },

  update: function () {
    switch (state.gamePhase) {
      case 'playing':
        this.player.depth = this.player.y + this.player.height / 2;
        this.opponent.depth = this.opponent.y + this.opponent.height / 2;

        this.topBackground.tilePositionX = this.cam.scrollX * 0.75;
        this.bottomBackground.tilePositionX = this.cam.scrollX * 1.05;

        this.socket.emit('player moved', {
          up: this.cursors.up.isDown,
          down: this.cursors.down.isDown,
          left: this.cursors.left.isDown,
          right: this.cursors.right.isDown,
        });
        break;
      case 'winning':
        this.player.anims.play((state.playerIndex === 0 ? 'pikachu' : 'eevee') + '_cheer', true);
        break;
    }
  },
});

const moveCharacter = (scene, character, characterIndex, cursors) => {
  var characterString = characterIndex === 0 ? 'pikachu' : 'eevee';

  character.anims.play(characterString + '_run', true);

  var moving = 2;

  if (cursors.left) {
    character.setVelocityX(-250);
    character.flipX = true;
  } else if (cursors.right) {
    character.setVelocityX(250);
    character.flipX = false;
  } else {
    character.setVelocityX(0);
    moving--;
  }
  if (cursors.up) {
    character.setVelocityY(-150);
  } else if (cursors.down) {
    character.setVelocityY(150);
  } else {
    character.setVelocityY(0);
    moving--;
  }
  if (!moving) {
    character.anims.play(characterString + '_idle', true);
    character.anims.pause();
  }
};

const spawnCharacter = (scene, characterIndex) => {
  var characterString = characterIndex === 0 ? 'pikachu' : 'eevee';

  var startPosX = 60;
  var startPosY = characterIndex === 0 ? 240 : 300;

  var character = scene.physics.add
    .sprite(startPosX, startPosY, characterString + '_idle')
    .setScale(2)
    .setSize(24, 12)
    .setOffset(12, 24)
    .setCollideWorldBounds(true);

  character.anims.play(characterString + '_idle');

  return character;
};

const drawBushes = (scene, seed) => {
  console.log(seed);

  var bushes = scene.physics.add.staticGroup();
  var randoms = [];

  for (var i = 0; i < 2 * constants.bushesCount; i++) {
    var x = Math.sin(seed++) * 10000;
    randoms.push(x - Math.floor(x));
  }

  for (var i = 0; i < 2 * constants.bushesCount; i += 2) {
    var x = randoms[i] * 6400;
    var y = 220 + randoms[i + 1] * 160;

    const number = Math.floor(Math.random() * 2);
    console.log(number);
    var bush = scene.add.image(x, y, 'bush' + number).setScale(2);
    bush.depth = bush.y + bush.height / 2;

    bushes.add(bush);
  }

  return bushes;
};

state.scenes.push(gamePlayState);
