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
          .setSize(24, 24)
          .setOffset(12, 24)
          .setCollideWorldBounds(true);

        this.opponent.anims.play(this.opponentCharacterString + '_idle');
        this.opponent.anims.pause();

        this.physics.add.collider(this.opponent, this.player);
        state.gameStarted = true;
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
      .setSize(24, 24)
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
    if(state.gameStarted)
    {
      this.opponent.depth = this.opponent.y + this.opponent.height / 2;
    }

    this.player.setVelocity(0);

    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-250);
      this.player.flipX = true;
      this.player.anims.play(this.selectedCharacterString + '_run', true);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(250);
      this.player.flipX = false;
      this.player.anims.play(this.selectedCharacterString + '_run', true);
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-150);
      this.player.anims.play(this.selectedCharacterString + '_run', true);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(150);
      this.player.anims.play(this.selectedCharacterString + '_run', true);
    } else if (!this.cursors.left.isDown && !this.cursors.right.isDown) {
      this.player.anims.play(this.selectedCharacterString + '_idle', true);
      this.player.anims.pause();
    }

    this.player.depth = this.player.y + this.player.height / 2;

    this.topBackground.tilePositionX = this.cam.scrollX * 0.75;
    this.bottomBackground.tilePositionX = this.cam.scrollX * 1.05;
  },
});

state.scenes.push(gamePlayState);
