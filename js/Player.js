/**
 * @author Gabriel Titerlea
 *
 * The Player class representing the players in the game
 * @param image
 *  the image displayed on the map for the player
 * @param gridPosition
 *  the initial grid position of the player
 * @param shadow
 *  the shadow image for the player
 * @param id
 *  the id of the player, it can be either 1 or 2
 */
var Player = function (image, shadow, gridPosition, id) {
  this.id = id;

  this.speed = 1.81;
  this.bombStrength = 1;

  this.dead = false;

  this.direction = Direction.NONE;

  this.escapeBomb = null;
  this.availableBombs = 1;

  this.willCollide = false;

  this.score = 0;
  this.streak = 0;

  var spriteSheet = new createjs.SpriteSheet({
    images: [image],
    frames: {width: gSize, height: gSize},
    animations: {
      idle: [0, 0, false],
      down: [0, 3, 'down', 0.1],
      left: [4, 7, 'left', 0.1],
      up: [8, 11, 'up', 0.1],
      right: [12, 15, 'right', 0.1]
    }
  });

  this.bmp = new createjs.Sprite(spriteSheet, 'idle');

  this.position = Utils.convertToPixelPosition( gridPosition);

  // effectOffset is used to offset the images up so that the players look 3d
  this.effectOffset = 8;

  this.bmp.x = this.position.x;
  this.bmp.y = this.position.y - this.effectOffset;

  // shadowOffset is used to place the shadow right at the bottom of the players feet
  this.shadowOffset = 22.5;

  this.shadow = new createjs.Bitmap(shadow);
  this.shadow.x = this.position.x;
  this.shadow.y = this.position.y + this.shadowOffset - this.effectOffset;
};

/**
 * @author Gabriel Titerlea
 *
 * Change the player's moving direction and its animation
 * @param direction
 *  The direction in which the player will move
 * @param leaveAnimation
 *  If it is set the animation will be left unchanged
 */
Player.prototype.move = function ( direction, leaveAnimation) {

  var previousDirection = this.direction;
  this.direction = direction;

  if (!leaveAnimation) {
    if (direction !== Direction.NONE) {
      // changes the animation only if it is a new one
      if (direction.name.charAt(0) !== previousDirection.name.charAt(0)) {
        this.bmp.gotoAndPlay( this.direction.name);
      }
    } else {
      // DIRECTION.NONE staying still
      if (direction.name.charAt(0) !== previousDirection.name.charAt(0)) {
        this.bmp.gotoAndStop( previousDirection.name);
      }
    }
  }
};

/**
 * @author Gabriel Titerlea
 *
 * Place a bomb on the current location if a bomb is not there already and if
 * the player still has available bombs
 * @param bombImage
 *  The image of the bomb
 * @param bombShadow
 *  The image for the bomb shadow
 */
Player.prototype.placeBomb = function ( bombImage, bombShadow) {

  var gridPosition = Utils.convertToGridPosition( this.position);

  if ( this.availableBombs > 0 && this.escapeBomb === null && !this.dead) {
    this.availableBombs--;
    return new Bomb( bombImage, bombShadow, gridPosition, this.bombStrength, this);
  }

  return null;
};

/**
 * @author Gabriel Titerlea
 *
 * When a bomb explodes this method will be called to increase the available bombs
 */
Player.prototype.recoverBomb = function () {
  this.availableBombs++;
};

/**
 * @author Gabriel Titerlea
 *
 * @param bonus
 *  The bonus to be applied
 */
Player.prototype.applyBonus = function ( bonus) {
  switch (bonus.type) {
  case 'speed_bonus':
    this.speed += 0.25;
    break;
  case 'bomb_bonus':
    this.availableBombs++;
    break;
  case 'fire_bonus':
    this.bombStrength++;
    break;
  }
};

/**
 * @author Gabriel Titerlea
 *
 * if the move won't cause a collision update the player's position based on his direction and speed
 * */
Player.prototype.update = function () {
  if (!this.willCollide) {
    // update the position
    var speed = this.speed;

    this.position.x += this.direction.x * speed;
    this.position.y += this.direction.y * speed;

    // update the image location based on the position
    this.bmp.x = this.position.x;
    this.bmp.y = this.position.y - this.effectOffset;

    this.shadow.x = this.position.x;
    this.shadow.y = this.position.y + this.shadowOffset - this.effectOffset;
  }
};

Player.prototype.fade = function () {

  var bmp = this.bmp;
  var shadow = this.shadow;

  var fade = setInterval( function() {
    bmp.alpha -= 0.035;
    shadow.alpha -= 0.035;

    if (bmp.alpha <= 0.35) {
      clearInterval(fade);
    }
  }, 30);
};