var gamePlayState = new Phaser.Class({
  // Define scene
  Extends: Phaser.Scene,

  initialize: function GamePlay() {
    Phaser.Scene.call(this, { key: 'GamePlay' });
  },

  preload: function () {},

  create: function () {
    console.log('GamePlay');
    this.topBackground = this.add.tileSprite(0, 0, 640, 480, 'world_top_background');
    this.topBackground.setOrigin(0);
    this.topBackground.setScrollFactor(0);

    this.bottomBackground = this.add.tileSprite(0, 0, 640, 480, 'world_bottom_background');
    this.bottomBackground.setOrigin(0);
    this.bottomBackground.setScrollFactor(0);

    this.selectedCharacterString = state.selectedCharacter === 0 ? 'pikachu' : 'eevee';

    this.player = this.add.sprite(60, 240, this.selectedCharacterString + '_idle').setScale(2);

    this.player.anims.play(this.selectedCharacterString + '_run');

    this.cursors = this.input.keyboard.createCursorKeys();

    this.myCam = this.cameras.main;
    this.myCam.setBounds(0, 0, 6400, 480);

    this.myCam.startFollow(this.player);
  },

  update: function () {
    this.player.x += 3;

    if (this.cursors.up.isDown && this.player.y > 240 - 32) {
      this.player.y -= 2;
    } else if (this.cursors.down.isDown && this.player.y < 480 - 64 - 64) {
      this.player.y += 2;
    }

    this.topBackground.tilePositionX = this.myCam.scrollX * 0.75;
    this.bottomBackground.tilePositionX = this.myCam.scrollX * 1.25;
  },
});

state.scenes.push(gamePlayState);
