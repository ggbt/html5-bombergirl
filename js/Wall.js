/**
 * @author Gabriel Titerlea
 *
 * The Wall class representing the walls in the game
 * @param gridPosition
 *  The grid position of the wall
 * @param image (optional)
 *  The image displayed on the map for the wall
 */
Wall = function ( gridPosition, image) {

  var offsetForShadow = 13.5;

  this.position = Utils.convertToPixelPosition( gridPosition);

  if (image) {
    this.bmp = new createjs.Bitmap( image);
    this.bmp.x = this.position.x - offsetForShadow;
    this.bmp.y = this.position.y - offsetForShadow;
  }
};