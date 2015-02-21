/**
 * @author Gabriel Titerlea
 *
 * The Wood class representing the woods in the game, the destructible tiles
 * @param image
 *  The image displayed on the map for a wood
 * @param gridPosition
 *  The grid position of the wood
 *  */
Wood = function ( image, gridPosition) {

  var offsetForShadow = 13.5;

  this.position = Utils.convertToPixelPosition( gridPosition);

  this.bmp = new createjs.Bitmap(image);
  this.bmp.x = this.position.x - offsetForShadow;
  this.bmp.y = this.position.y - offsetForShadow;
};