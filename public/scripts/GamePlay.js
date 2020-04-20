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

    this.add.sprite(6200, 140, 'flag').setOrigin(0).setScale(2).play('flag');

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

      state.slowDown[this.opponent] = 0;
      state.slowDown[this.player] = 0;

      this.physics.add.collider(this.opponent, this.player);
      this.physics.add.overlap(this.opponent, this.bushes, () => {
        state.slowDown[1 - state.playerIndex] = 1;
      });
      this.physics.add.overlap(this.player, this.bushes, () => {
        state.slowDown[state.playerIndex] = 1;
      });

      state.gamePhase = 'playing';

      this.flashWait1.remove();
      this.flashWait2.remove();
      this.waiting.destroy();

      this.run = this.add.bitmapText(320, 30, 'pokemon_font', 'Run!', 40);
      this.run.setOrigin(0.5);

      this.time.addEvent({
        delay: 2000,
        callback: () => {
          this.run.destroy();
        },
        loop: false,
      });
    });

    this.socket.on('player moved', (cursors) => moveCharacter(this.player, state.playerIndex, cursors));

    this.socket.on('opponent moved', (cursors) => moveCharacter(this.opponent, 1 - state.playerIndex, cursors));

    this.socket.on('autowin', () => {
      state.gamePhase = 'winning';

      this.opponent.destroy();

      this.add
        .bitmapText(
          this.cam.scrollX + 320,
          30,
          'pokemon_font',
          '' + (state.playerIndex === 0 ? 'Eevee' : 'Pikachu') + ' resigned. You win!',
          40
        )
        .setOrigin(0.5);

      this.time.addEvent({
        delay: 5000,
        callback: () => {
          state.gamePhase = 'waiting';
          this.socket.emit('disconnect', null);
          this.scene.start('MainMenu');
        },
        loop: false,
      });
    });

    this.socket.on('game won', () => {
      state.gamePhase = 'winning';


      this.add
        .bitmapText(
          this.cam.scrollX + 320,
          30,
          'pokemon_font',
          '' + (state.playerIndex === 0 ? 'Pikachu' : 'Eevee') + ' wins!',
          40
        )
        .setOrigin(0.5);

      this.time.addEvent({
        delay: 5000,
        callback: () => {
          state.gamePhase = 'waiting';
          this.socket.emit('disconnect', null);
          this.scene.start('MainMenu');
        },
        loop: false,
      });
    });

    this.socket.on('game lost', () => {
      state.gamePhase = 'losing';


      this.add
        .bitmapText(
          this.cam.scrollX + 320,
          30,
          'pokemon_font',
          '' + (state.playerIndex === 0 ? 'Eevee' : 'Pikachu') + ' wins!',
          40
        )
        .setOrigin(0.5);

      this.time.addEvent({
        delay: 5000,
        callback: () => {
          state.gamePhase = 'waiting';
          this.socket.emit('disconnect', null);
          this.scene.start('MainMenu');
        },
        loop: false,
      });
    });

    this.socket.on('round won', (score) => {
      state.gamePhase = 'winning';
      roundFinished(this, score);
    });

    this.socket.on('round lost', (score) => {
      state.gamePhase = 'losing';
      roundFinished(this, score);
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

        if (this.player.x >= 6200) this.socket.emit('finish line', null);
        break;
      case 'winning':
        this.player.anims.play((state.playerIndex === 0 ? 'pikachu' : 'eevee') + '_cheer', true);
        this.player.setVelocity(0);

        this.opponent.anims.play((state.playerIndex === 0 ? 'eevee' : 'pikachu') + '_run', true);
        this.opponent.setVelocity(0);
        break;
      case 'losing':
        this.opponent.anims.play((state.playerIndex === 0 ? 'eevee' : 'pikachu') + '_cheer', true);
        this.opponent.setVelocity(0);
        
        this.player.anims.play((state.playerIndex === 0 ? 'pikachu' : 'eevee') + '_run', true);
        this.player.setVelocity(0);
        break;
    }
  },
});

const roundFinished = (scene, score) => {
  var scoreboardText = 'Pikachu ' + score.pikachuScore + ' - ' + score.eeveeScore + ' Eevee';
  scene.scoreboard = scene.add
    .bitmapText(scene.cam.scrollX + 320, 30, 'pokemon_font', scoreboardText, 40)
    .setOrigin(0.5);

  scene.time.addEvent({
    delay: 5000,
    callback: () => {
      state.gamePhase = 'playing';
      scene.player.destroy();
      scene.opponent.destroy();
      scene.scoreboard.destroy();

      scene.player = spawnCharacter(scene, state.playerIndex);
      scene.opponent = spawnCharacter(scene, 1 - state.playerIndex);

      scene.cam = scene.cameras.main;
      scene.cam.setBounds(0, 0, 6400, 480);
      scene.cam.startFollow(scene.player);

      state.slowDown[scene.opponent] = 0;
      state.slowDown[scene.player] = 0;

      scene.physics.add.collider(scene.opponent, scene.player);
      scene.physics.add.overlap(scene.opponent, scene.bushes, () => {
        state.slowDown[1 - state.playerIndex] = 1;
      });
      scene.physics.add.overlap(scene.player, scene.bushes, () => {
        state.slowDown[state.playerIndex] = 1;
      });

      scene.run = scene.add.bitmapText(320, 30, 'pokemon_font', 'Run!', 40);
      scene.run.setOrigin(0.5);

      scene.time.addEvent({
        delay: 2000,
        callback: () => {
          scene.run.destroy();
        },
        loop: false,
      });
    },
    loop: false,
  });
};

const moveCharacter = (character, characterIndex, cursors) => {
  var characterString = characterIndex === 0 ? 'pikachu' : 'eevee';

  character.anims.play(characterString + '_run', true);

  var moving = 2;

  var xVelocity = 250 - state.slowDown[characterIndex] * 150;
  var yVelocity = 150 - state.slowDown[characterIndex] * 100;

  state.slowDown[characterIndex] = 0;

  if (cursors.left) {
    character.setVelocityX(-xVelocity);
    character.flipX = true;
  } else if (cursors.right) {
    character.setVelocityX(xVelocity);
    character.flipX = false;
  } else {
    character.setVelocityX(0);
    moving--;
  }
  if (cursors.up) {
    character.setVelocityY(-yVelocity);
  } else if (cursors.down) {
    character.setVelocityY(yVelocity);
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
    .setOffset(12, 36)
    .setCollideWorldBounds(true);

  character.anims.play(characterString + '_idle');

  return character;
};

const drawBushes = (scene, seed) => {
  var bushes = scene.physics.add.staticGroup();
  var randoms = [];

  for (var i = 0; i < 2 * constants.bushesCount; i++) {
    var x = Math.sin(seed++) * 10000;
    randoms.push(x - Math.floor(x));
  }

  for (var i = 0; i < 2 * constants.bushesCount; i += 2) {
    var x = randoms[i] * 6400;
    var y = 240 + randoms[i + 1] * 160;

    const number = Math.floor(Math.random() * 2);
    var bush = scene.add.image(x, y, 'bush' + number).setScale(2);
    bush.width = 48;
    bush.height = 36;
    bush.displayOriginY = 48;
    bush.depth = bush.y + bush.height / 2 - 48;

    console.log(bush);
    bushes.add(bush);

    // bushes.create(x, y, 'bush' + number).setScale(2);
  }

  return bushes;
};

state.scenes.push(gamePlayState);
