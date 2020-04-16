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

    this.player = this.physics.add.sprite(60, 240, this.selectedCharacterString + '_idle').setScale(2);

    this.player.anims.play(this.selectedCharacterString + '_idle');
    this.player.anims.pause();
    
    
    this.cursors = this.input.keyboard.createCursorKeys();

    this.myCam = this.cameras.main;
    this.myCam.setBounds(0, 0, 6400, 480);

    this.myCam.startFollow(this.player);
  },

  update: function () {
    this.player.setVelocity(0);

    if (this.cursors.left.isDown && this.player.x > 32) {
      this.player.setVelocityX(-250);
      this.player.flipX = true;
      this.player.anims.play(this.selectedCharacterString + '_run', true);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(250);
      this.player.flipX = false;
      this.player.anims.play(this.selectedCharacterString + '_run', true);
    }

    if (this.cursors.up.isDown && this.player.y > 210) {
      this.player.setVelocityY(-150);
      this.player.anims.play(this.selectedCharacterString + '_run', true);
    } else if (this.cursors.down.isDown &&this.player.y < 360) {
      this.player.setVelocityY(150);
      this.player.anims.play(this.selectedCharacterString + '_run', true);
    } else if(!this.cursors.left.isDown && !this.cursors.right.isDown) {
      this.player.anims.play(this.selectedCharacterString + '_idle', true);
      this.player.anims.pause();
    }
    this.topBackground.tilePositionX = this.myCam.scrollX * 0.75;
    this.bottomBackground.tilePositionX = this.myCam.scrollX * 1.25;
  },
});

state.scenes.push(gamePlayState);
