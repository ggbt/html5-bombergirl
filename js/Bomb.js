/**
 * @author Gabriel Titerlea
 *
 * The Bomb class representing the bombs in the game
 * @param image
 *  The image of the bomb
 * @param shadow
 *  The shadow image of the bomb
 * @param gridPosition
 *  The grid position of the bomb
 * @param strength
 *  The strength of the bomb (the number of fires it will generate when exploding)
 * @param owner
 *  The player who has set this bomb
 * @param timerMax
 *  The time it takes for the bomb to explode
 *  */
Bomb = function (image, shadow, gridPosition, strength, owner, timerMax) {
  this.owner = owner;

  /**
   * time in frames
   * */
  this.timer = 0;

  /**
   * time in frames
   * */
  this.timerMax = timerMax || 138;

  /**
   * The strength of the bomb
   * */
  this.strength = strength;

  this.exploded = false;

  var spriteSheet = new createjs.SpriteSheet({
    images: [image],
    frames: { width: gSize, height: gSize},
    animations: {
      idle: [0, 4, 'idle', 0.1]
    }
  });

  this.bmp = new createjs.Sprite( spriteSheet, 'idle');

  this.position = Utils.convertToPixelPosition( gridPosition);

  this.bmp.x = this.position.x;
  this.bmp.y = this.position.y;

  this.shadow = new createjs.Bitmap( shadow);

  this.shadow.x = this.position.x;
  this.shadow.y = this.position.y + 19.5;

  this.gridPosition = gridPosition;
};

/**
 * @author Gabriel Titerlea
 *
 * Increases the time the bomb has been staying alive
 * If the limit is reached, the bomb explodes
 * */
Bomb.prototype.tick = function () {
  if (this.exploded) {
    return true;
  }

  this.timer++;
  return this.timer > this.timerMax; // * createjs.Ticker.getMeasuredFPS();
};

Bomb.prototype.getDangerPositions = function ( tiles) {

  var dangerPositions = [];

  var directions = [
    {x: 0, y: -1}, // up
    {x: 0, y: 1},  // down
    {x: -1, y: 0}, // left
    {x: 1, y: 0}   // right
  ];

  for (var i = 0; i < directions.length; i++) {
    var dir = directions[i];

    // the distance the fire has reached
    var reach = 0;

    var stop = false;
    while (reach < this.strength && !stop) {
      reach++;

      var dangerPos = {
        x: this.gridPosition.x + dir.x * reach,
        y: this.gridPosition.y + dir.y * reach,
      };

      // if the position is empty or it's not a wall
      if (!tiles[dangerPos.x][dangerPos.y] || !(tiles[dangerPos.x][dangerPos.y] instanceof Wall)) {
        dangerPositions.push( dangerPos);
        // Stop if a wood has been reached (a bomb only burns one wood)
        if (tiles[dangerPos.x][dangerPos.y] instanceof Wood) {
          stop = true;
        }
      } else {
        stop = true;
      }
    }
  }

  dangerPositions.push( this.gridPosition);
  return dangerPositions;
};