/**
 * @author Gabriel Titerlea
 *
 * The Fire class representing the fires in the game
 * */
var Fire = function (image, gridPosition) {

  this.extinguished = false;

  this.gridPosition = gridPosition;

  var spriteSheet = new createjs.SpriteSheet({
    images: [image],
    frames: { width: gSize + 2, height: gSize + 2},
    animations: {
      burn: [0, 6, false, 0.3],
      extinguished: [7, 7, false]
    }
  });

  this.bmp = new createjs.Sprite( spriteSheet, 'burn');

  var self = this;
  this.bmp.addEventListener('animationend', function() {
    self.extinguished = true;
    self.bmp.gotoAndStop('extinguished');
  });

  this.position = Utils.convertToPixelPosition( gridPosition);

  this.bmp.x = this.position.x - 1;
  this.bmp.y = this.position.y - 1;
};