var gamePlayState = new Phaser.Class({
  // Define scene
  Extends: Phaser.Scene,

  initialize: function GamePlay() {
    Phaser.Scene.call(this, { key: 'GamePlay' });
  },

  preload: function () {},

  create: function () {
    console.log('GamePlay');
    this.socket = io();
    this.socket.emit('lfg', state.selectedCharacter);

    this.socket.on(
      'game found',
      function () {
        this.opponentCharacterString = state.selectedCharacter !== 0 ? 'pikachu' : 'eevee';

        this.opponent = this.physics.add
          .sprite(60, state.selectedCharacter !== 0 ? 240 : 300, this.opponentCharacterString + '_idle')
          .setScale(2)
          .setSize(24, 12)
          .setOffset(12, 24)
          .setCollideWorldBounds(true);

        this.opponent.anims.play(this.opponentCharacterString + '_idle');
        this.opponent.anims.pause();

        this.physics.add.collider(this.opponent, this.player);
        state.gameStarted = true;
      }.bind(this)
    );

    this.socket.on(
      'player moved',
      function (cursors) {
        this.player.setVelocity(0);

        if (cursors.left) {
          this.player.setVelocityX(-250);
          this.player.flipX = true;
          this.player.anims.play(this.selectedCharacterString + '_run', true);
        } else if (cursors.right) {
          this.player.setVelocityX(250);
          this.player.flipX = false;
          this.player.anims.play(this.selectedCharacterString + '_run', true);
        }

        if (cursors.up) {
          this.player.setVelocityY(-150);
          this.player.anims.play(this.selectedCharacterString + '_run', true);
        } else if (cursors.down) {
          this.player.setVelocityY(150);
          this.player.anims.play(this.selectedCharacterString + '_run', true);
        } else if (!cursors.left && !cursors.right) {
          this.player.anims.play(this.selectedCharacterString + '_idle', true);
          this.player.anims.pause();
        }
      }.bind(this)
    );

    this.socket.on(
      'opponent moved',
      function (cursors) {
        this.opponent.setVelocity(0);

        if (cursors.left) {
          this.opponent.setVelocityX(-250);
          this.opponent.flipX = true;
          this.opponent.anims.play(this.opponentCharacterString + '_run', true);
        } else if (cursors.right) {
          this.opponent.setVelocityX(250);
          this.opponent.flipX = false;
          this.opponent.anims.play(this.opponentCharacterString + '_run', true);
        }

        if (cursors.up) {
          this.opponent.setVelocityY(-150);
          this.opponent.anims.play(this.opponentCharacterString + '_run', true);
        } else if (cursors.down) {
          this.opponent.setVelocityY(150);
          this.opponent.anims.play(this.opponentCharacterString + '_run', true);
        } else if (!cursors.left && !cursors.right) {
          this.opponent.anims.play(this.opponentCharacterString + '_idle', true);
          this.opponent.anims.pause();
        }
      }.bind(this)
    );

    this.physics.world.setBounds(0, 216, 480, 200);
    this.physics.world.setBoundsCollision(true, false, true, true);

    this.topBackground = this.add.tileSprite(0, 0, 640, 480, 'world_top_background');
    this.topBackground.setOrigin(0);
    this.topBackground.setScrollFactor(0);

    this.bottomBackground = this.add.tileSprite(0, 0, 640, 480, 'world_bottom_background');
    this.bottomBackground.setOrigin(0);
    this.bottomBackground.setScrollFactor(0);

    this.selectedCharacterString = state.selectedCharacter === 0 ? 'pikachu' : 'eevee';

    this.player = this.physics.add
      .sprite(60, state.selectedCharacter === 0 ? 240 : 300, this.selectedCharacterString + '_idle')
      .setScale(2)
      .setSize(24, 12)
      .setOffset(12, 24)
      .setCollideWorldBounds(true);

    this.player.anims.play(this.selectedCharacterString + '_idle');
    this.player.anims.pause();

    this.cursors = this.input.keyboard.createCursorKeys();

    this.cam = this.cameras.main;
    this.cam.setBounds(0, 0, 6400, 480);

    this.cam.startFollow(this.player);
  },

  update: function () {
    if (state.gameStarted) {
      this.opponent.depth = this.opponent.y + this.opponent.height / 2;
    }

    this.player.depth = this.player.y + this.player.height / 2;

    this.topBackground.tilePositionX = this.cam.scrollX * 0.75;
    this.bottomBackground.tilePositionX = this.cam.scrollX * 1.05;

    this.socket.emit('player moved', {
      up: this.cursors.up.isDown,
      down: this.cursors.down.isDown,
      left: this.cursors.left.isDown,
      right: this.cursors.right.isDown,
    });
  },
});

state.scenes.push(gamePlayState);
