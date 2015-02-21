
/**
 * @author Gabriel Titerlea
 *
 * The Bot class representing the bots in the game
 * @param image
 *  the image displayed on the map for the player
 * @param shadow
 *  the image for the bot shadow
 * @param gridPosition
 *  the initial grid position of the player
 */
var Bot = function ( image, shadow, gridPosition) {

  this.nearWood = false;
  this.nearPlayer = false;

  this.speed = 1.81;
  this.bombStrength = 1;

  this.previousGridPos = gridPosition;
  this.gridPosition = gridPosition;

  this.destination = Utils.convertToPixelPosition(gridPosition);

  this.direction = Direction.NONE;
  this.previousDirection = Direction.NONE;

  this.escapeBomb = null;
  this.availableBombs = 1;

  this.willCollide = false;

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

  this.effectOffset = 9;

  this.bmp.x = this.position.x;
  this.bmp.y = this.position.y - this.effectOffset;

  this.shadowOffset = 22;

  this.shadow = new createjs.Bitmap(shadow);
  this.shadow.x = this.position.x;
  this.shadow.y = this.position.y + this.shadowOffset - this.effectOffset;
};

/**
 * @author Gabriel Titerlea
 *
 * Change the bot's moving direction and its animation
 * @param direction
 *  The direction in which the bot will move
 */
Bot.prototype.move = function ( direction) {

  this.previousDirection = this.direction;
  this.direction = direction;

  if (direction !== Direction.NONE) {
    // update the animation only if it's a mew one
    if (direction.name.charAt(0) !== this.previousDirection.name.charAt(0)) {
      this.bmp.gotoAndPlay(this.direction.name);
    }
  } else {
    // DIRECTION.NONE staying still
    if (direction.name.charAt(0) !== this.previousDirection.name.charAt(0)) {
      this.bmp.gotoAndStop(this.previousDirection.name);
    }
  }
};

/**
 * @author Gabriel Titerlea
 *
 * Place a bomb on the current location if a bomb is not there already and if
 * the bot still has available bombs
 * @param bombImage
 *  The image of the bomb
 * @param bombShadow
 *  The image for the bomb shadow
 */
Bot.prototype.placeBomb = function ( bombImage, bombShadow) {

  var gridPosition = Utils.convertToGridPosition( this.position);

  if ( this.availableBombs > 0 && this.escapeBomb === null) {
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
Bot.prototype.recoverBomb = function () {
  this.availableBombs++;
};

Bot.prototype.applyBonus = function ( bonus) {
  switch (bonus.type) {
  case 'speed_bonus':
    this.speed += 0.25;
    break;
  case 'bomb_bonus':
    this.availableBombs++; // commented to decrease the suicide rate of the bots :D
    break;
  case 'fire_bonus':
    this.bombStrength++;
    break;
  }
};

/**
 * @author Gabriel Titerlea
 *
 * Sets the new destination of the bot and calls the move method to update the animtaion accordingly
 */
Bot.prototype.setDestination = function ( destination) {
  if  (this.gridPosition.x > destination.x) {
    this.move( Direction.LEFT);
  } else if (this.gridPosition.x < destination.x) {
    this.move( Direction.RIGHT);
  } else if (destination.y < this.gridPosition.y) {
    this.move( Direction.UP);
  } else if (destination.y > this.gridPosition.y) {
    this.move( Direction.DOWN);
  } else {
    this.move( Direction.NONE);
  }

  this.destination = Utils.convertToPixelPosition( destination);
};

/**
 * @author Gabriel Titerlea
 */
Bot.prototype.updateGridPosition = function () {

  var gridPosition = Utils.convertToGridPosition( this.position);

  if (gridPosition.x !== this.gridPosition.x || gridPosition.y !== this.gridPosition.y) {
    this.previousGridPos = this.gridPosition;
    this.gridPosition = gridPosition;
  }
};

/**
 * @author Gabriel Titerlea
 *
 * Update the bots position based on his direction and speed
 * if the move won't cause a collision
 * */
Bot.prototype.update = function () {
  var distanceX = Math.abs(this.destination.x - this.position.x);
  var distanceY = Math.abs(this.destination.y - this.position.y);

  // update the position
  var speed = this.speed;

  // if the distance to the destination is less than a step only move as much as is needed to reach the destination
  if (distanceX > 0 && distanceX < speed) {
    speed = distanceX;
  } else if (distanceY > 0 && distanceY < speed) {
    speed = distanceY;
  }

  this.position.x += this.direction.x * speed;
  this.position.y += this.direction.y * speed;

  // update the image location based on the position
  this.bmp.x = this.position.x;
  this.bmp.y = this.position.y - this.effectOffset;

  this.shadow.x = this.position.x;
  this.shadow.y = this.position.y + this.shadowOffset - this.effectOffset;

  this.updateGridPosition();
};

Bot.prototype.fade = function ( leaveStage) {

  var timer = 0;

  var bmp = this.bmp;
  var shadow = this.shadow;

  bmp.filters = [ new createjs.ColorMatrixFilter([
    0.30,0.30,0.40,0,0, // red component
    0.35,0.35,0.30,0,0, // green component
    0.30,0.30,0.30,0,0, // blue component
    0,0,0,1,0  // alpha
  ])];

  bmp.cache( 0,0, 100, 100);
  bmp.updateCache( 0,0, 100, 100);

  var fade = setInterval( function() {

    timer++;
    if (timer > 25) {
      bmp.y -= 0.7;

      bmp.alpha -= 0.045;
      shadow.alpha -= 0.045;
    }

    if ( bmp.alpha <= 0) {
      clearInterval(fade);
      leaveStage();
    }
  }, 30);
};