/**
 * @author Gabriel Titerlea
 *
 * The InputEngine class dealing with input and actions for input
 * */
var InputEngine = function () {
  this.actions = {};
  this.listeners = {};

  this.bindings = {
    '38': 'up1',
    '37': 'left1',
    '40': 'down1',
    '39': 'right1',
    '191': 'bomb1',
    '87': 'up2',
    '65': 'left2',
    '83': 'down2',
    '68': 'right2',
    '9': 'bomb2',
    '13': 'restart',
    '27': 'escape',
    '77': 'mute',
    '80': 'pause'
  };

  this.touchStart = {
    x: 0,
    y: 0
  };

  this.latestMove = new Date();
};

InputEngine.prototype.onTouchStart = function ( event) {

  event.preventDefault();

  this.touchStart.x = event.changedTouches[0].pageX;
  this.touchStart.y = event.changedTouches[0].pageY;

  this.startTime = new Date();
};

InputEngine.prototype.onTouchMove = function ( event) {

  event.preventDefault();

  var x = event.changedTouches[0].pageX - this.touchStart.x;
  var y = event.changedTouches[0].pageY - this.touchStart.y;

  this.actions[ 'right1'] = false;
  this.actions[ 'left1'] = false;
  this.actions[ 'up1'] = false;
  this.actions[ 'down1'] = false;

  if ( x > 5 && x >= Math.abs( y)) {
    this.actions[ 'right1'] = true;
  } else if ( x < -5 && Math.abs( x) >= Math.abs( y)) {
    this.actions[ 'left1'] = true;
  } else if ( y < -5 && Math.abs( y) > Math.abs( x)) {
    this.actions[ 'up1'] = true;
  } else if ( y > 5 && y > Math.abs( x)) {
    this.actions[ 'down1'] = true;
  }

};

InputEngine.prototype.onTouchEnd = function ( event) {

  event.preventDefault();

  var touchEnd = {
    x: event.changedTouches[0].pageX,
    y: event.changedTouches[0].pageY
  };

  var endTime = new Date();
  var timeEllapsed = endTime.getTime() - this.startTime.getTime();

  if ( Math.abs( touchEnd.x - this.touchStart.x) < 5 &&
    Math.abs( touchEnd.y - this.touchStart.y) < 5 &&
    timeEllapsed < 300) {

    this.actions[ 'bomb1'] = true;
  }

  this.actions['right1'] = false;
  this.actions['left1'] = false;
  this.actions['up1'] = false;
  this.actions['down1'] = false;
};

InputEngine.prototype.onKeyDown = function ( event) {
  var action = this.bindings[event.keyCode];
  if (action) {
    event.preventDefault();

    this.actions[action] = true;

    var listeners = this.listeners[action];
    if (listeners) {
      for (var i = 0; i < listeners.length; i++) {
        var listener = listeners[i];
        listener();
      }
    }
  }
  return false;
};

InputEngine.prototype.onKeyUp = function ( event) {
  var action = this.bindings[event.keyCode];
  if (action) {
    event.preventDefault();
    this.actions[action] = false;
  }
  return false;
};

InputEngine.prototype.cancelAll = function () {
  for (var action in this.actions) {
    if (this.actions.hasOwnProperty(action)) {
      this.actions[action] = false;
    }
  }
};

InputEngine.prototype.addListener = function( action, listener) {
  this.listeners[action] = this.listeners[action] || [];
  this.listeners[action].push(listener);
};

InputEngine.prototype.removeListeners = function( action) {
  this.listeners[action] = [];
};