/**
 * @author Gabriel Titerlea
 */
var Bonus = function ( gridPosition, type, image) {
  this.type = type;

  this.position = Utils.convertToPixelPosition( gridPosition);
  this.gridPosition = gridPosition;

  this.bmp = new createjs.Bitmap(image);
  this.bmp.x = this.position.x;
  this.bmp.y = this.position.y;
};