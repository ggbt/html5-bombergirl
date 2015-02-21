/**
 * @author Gabriel Titerlea
 *
 * The OANumber class representing the open arithmetic numbers in the game
 * */
var OANumber = function ( nr, bgColor, gridPosition, owner) {
  this.owner = owner;
  this.nr = nr;

  this.position = Utils.convertToPixelPosition( gridPosition);

  if (owner === 1) {
    this.txt = new createjs.Text( nr, '20px Trebuchet MS', '#1B1B1B');
  } else {
    this.txt = new createjs.Text( nr, '20px Trebuchet MS', '#E4EEFC');
  }

  var FireFox = !(window.mozInnerScreenX == null);
  if (nr < 10) {
    this.txt.x = this.position.x + 12.5;
    this.txt.y = this.position.y + 5;
  } else {
    this.txt.x = this.position.x + 7.5;
    this.txt.y = this.position.y + 5;
  }
  if (FireFox) {
    this.txt.y = this.position.y + 9;
  }

  var bgGfx = new createjs.Graphics()
    .beginFill( bgColor)
    .beginStroke("#000000")
    .setStrokeStyle(1)
    .drawRect(this.position.x + 1, this.position.y + 1, gSize - 2, gSize - 2)
    .endFill();

  this.bg = new createjs.Shape( bgGfx);
  this.bg.alpha = 0.6;

  var hiddenBgGfx = new createjs.Graphics();
  if (owner === 1) {
    hiddenBgGfx.beginFill( '#FFEB8B');
  } else {
    hiddenBgGfx.beginFill( '#AF0103');
  }
  hiddenBgGfx.beginFill( '#FFEB8B');
  hiddenBgGfx.drawRect(this.position.x + 1, this.position.y + 1, gSize - 2, gSize - 2)
    .endFill();

  this.hiddenBG = new createjs.Shape( hiddenBgGfx);
  this.hiddenBG.alpha = 0.6;
};