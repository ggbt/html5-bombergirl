/**
 * Constant specifying the size of the images used in the game and the size of the tiles
 * */
var gSize = 37;

var Direction = {};
Object.defineProperties( Direction, {
  "NONE": {value: {x: 0, y: 0, name: 'idle', opposite: null}, writable: false, enumerable: true, configurable: false},
  "UP": {value: {x: 0, y: -1, name: 'up', opposite: 'down'}, writable: false, enumerable: true, configurable: false},
  "RIGHT": {value: {x: 1, y: 0, name: 'right', opposite: 'left'}, writable: false, enumerable: true, configurable: false},
  "DOWN": {value: {x: 0, y: 1, name: 'down', opposite: 'up'}, writable: false, enumerable: true, configurable: false},
  "LEFT": {value: {x: -1, y: 0, name: 'left', opposite: 'right'}, writable: false, enumerable: true, configurable: false}
});

/**
 * @author Gabriel Titerlea
 *
 * Holds utility methods used throughout the game
 * */
var Utils = {
  convertToPixelPosition: function ( gridPosition) {

    return {
      x: (gridPosition.x - 1) * gSize,
      y: (gridPosition.y - 1) * gSize
    };

  },
  convertToGridPosition: function ( pixelPosition) {

    return {
      x: Math.round(pixelPosition.x / gSize) + 1,
      y: Math.round(pixelPosition.y / gSize) + 1
    };

  },
  intersectPlayerAndTile: function ( player, tile) {
    var rectA = {
      left: player.x + 9,
      top: player.y + 13,
      right: player.x + gSize - 9,
      bottom: player.y + gSize - 2
    };

    var rectB = {
      left: tile.x,
      top: tile.y,
      right: tile.x + gSize,
      bottom: tile.y + gSize
    };

    return (rectA.left <= rectB.right &&
      rectB.left <= rectA.right &&
      rectA.top <= rectB.bottom &&
      rectB.top <= rectA.bottom);
  },
  getRandomInt: function (min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
  }
};