var Bombergirl = {
  /*
   * iniReady is used to only load resources once
   * */
  initReady: false,

  touch: false,

  // to limit showing off
  showOffTimes: 0,
  showingOff: false,

  /*
   * Game states
   * */
  paused: false,
  mute: false,
  quited: false,

  // number of tiles must be odd
  nrTilesWidth: 17,
  nrTilesHeight: 13,

  // the container element on which everything will be rendered
  canvas: null,

  notificationsArea: null,
  playerNotification1: null,
  playerNotification2: null,
  pausedIndicator: null,
  manualPaused: false,

  // the container on which everything will be rendered
  stage: null,

  spaceRatio: 1,

  // holds references to all the loaded images used in the game
  images: {},

  oaOperands: null,
  oaNumbers: null,

  // an array with the numbers player 1 must collect
  correctNumbers1: [],
  // numberOrder1 is a string which can be 'ascending'/'descending'
  numberOrder1: null,

  // an array with the numbers player 2 must collect
  correctNumbers2: [],
  numberOrder2: null,

  // input holds methods and variables which deal with input and actions
  input: null,

  players: [],
  bots: [],
  player1: null,
  player2: null,
  // the number of players currently playing the game
  nrPlayers: null,

  yellow: '#FFE900',
  red: '#FC0003',

  // a matrix of elements on the game map
  tiles: null,

  woodsPositions: [],

  bonuses: [],
  bonusesPercent: 16,
  bonusTypes: {
    0: 'speed_bonus',
    1: 'bomb_bonus',
    2: 'fire_bonus'
  },

  bombs: [],
  possibleFires: [],
  fires: [],

  soundtrack: null,
  soundtrackStarted: false,

  onKeyDown: null,
  onKeyUp: null,

  prepare:  function () {
    this.canvas = dom.createCanvas( 'bomberman_map', null, "", gSize * this.nrTilesWidth, gSize * this.nrTilesHeight);
    // document.getElementById( "quit").addEventListener( "click", this.handleClickQuitButtonEvent);

    this.touch = ('ontouchstart' in window)
      || (navigator.MaxTouchPoints > 0)
      || (navigator.msMaxTouchPoints > 0);

    this.input = new InputEngine();
    this.input.addListener( 'mute', this.toggleSound);
    this.input.addListener( 'pause', this.togglePause);
    this.input.addListener( 'escape', this.restart);

    this.onKeyDown = this.input.onKeyDown.bind( this.input);
    this.onKeyUp = this.input.onKeyUp.bind( this.input);
    this.onTouchStart = this.input.onTouchStart.bind( this.input);
    this.onTouchMove = this.input.onTouchMove.bind( this.input);
    this.onTouchEnd = this.input.onTouchEnd.bind( this.input);
  },

  start:  function () {

    // change the number of tiles on width to be lower than the number of tiles
    // on height to take advantage of the available space
    var containerSize = this.getContainerSizes();
    if (containerSize.width < containerSize.height) {
      if ( this.nrTilesWidth > this.nrTilesHeight) {
        var aux = this.nrTilesHeight;
        this.nrTilesHeight = this.nrTilesWidth;
        this.nrTilesWidth = aux;
      }
    } else if (containerSize.height < containerSize.width){
      if ( this.nrTilesHeight > this.nrTilesWidth) {
        var aux = this.nrTilesHeight;
        this.nrTilesHeight = this.nrTilesWidth;
        this.nrTilesWidth = aux;
      }
    }

    document.addEventListener( 'keydown', this.onKeyDown);
    document.addEventListener( 'keyup', this.onKeyUp);

    window.addEventListener( 'resize', this.scale);
    window.addEventListener( 'focus', this.unPause);
    window.addEventListener( 'blur', this.pause);

    // load resources only if it's the first time entering the game
    if (!this.initReady) {

      // display a loading text while the resources are loading
      var loadingText1 = dom.createSpan('', 'bomberman_loadingText redText', 'Bombergirl');
      var br = document.createElement( 'br');
      var loadingText2 = dom.createSpan('', 'bomberman_loadingText', 'Loading, please wait...');
      var renderBox = document.getElementById( 'renderBox');
      renderBox.appendChild( loadingText1);
      renderBox.appendChild( br);
      renderBox.appendChild( loadingText2);

      var loadQueue = new createjs.LoadQueue();
      loadQueue.installPlugin( createjs.Sound);

      var self = this;
      loadQueue.addEventListener( 'complete', function () {
        self.images['shadow'] = loadQueue.getResult( 'shadow');

        // player images
        self.images['betty'] = loadQueue.getResult( 'betty');
        self.images['betty2'] = loadQueue.getResult( 'betty2');

        // bots images
        self.images['george'] = loadQueue.getResult( 'george');
        self.images['george2'] = loadQueue.getResult( 'george2');
        self.images['george3'] = loadQueue.getResult( 'george3');

        self.images['wall'] = loadQueue.getResult( 'wall');
        self.images['bomb'] = loadQueue.getResult( 'bomb');
        self.images['wood'] = loadQueue.getResult( 'wood');
        self.images['fire'] = loadQueue.getResult( 'fire');

        self.images['speed_bonus'] = loadQueue.getResult( 'speed_bonus');
        self.images['bomb_bonus'] = loadQueue.getResult( 'bomb_bonus');
        self.images['fire_bonus'] = loadQueue.getResult( 'fire_bonus');

        self.initReady = true;
        renderBox.removeChild( loadingText1);
        renderBox.removeChild( br);
        renderBox.removeChild( loadingText2);

        self.startGame();
      });

      loadQueue.loadManifest([
        {id: 'shadow', src: 'resources/img/bomberman_shadow.png'},
        {id: 'betty', src: 'resources/img/bomberman_betty.png'},
        {id: 'betty2', src: 'resources/img/bomberman_betty2.png'},

        {id: 'george', src: 'resources/img/bomberman_george.png'},
        {id: 'george2', src: 'resources/img/bomberman_george2.png'},
        {id: 'george3', src: 'resources/img/bomberman_george3.png'},

        {id: 'wall',  src: 'resources/img/bomberman_wall.png'},
        {id: 'bomb',  src: 'resources/img/bomberman_bomb.png'},
        {id: 'wood',  src: 'resources/img/bomberman_wood.png'},
        {id: 'fire',  src: 'resources/img/bomberman_fire.png'},

        {id: 'speed_bonus',  src: 'resources/img/bomberman_speed_bonus.png'},
        {id: 'bomb_bonus',  src: 'resources/img/bomberman_bomb_bonus.png'},
        {id: 'fire_bonus',  src: 'resources/img/bomberman_fire_bonus.png'},

        {data: 1, id: 'game', src: 'resources/sound/bomberman_soundtrack.mp3|media/music/bomberman_soundtrack.ogg'},
        {data: 8, id: 'correct', src: 'resources/sound/bomberman_collect.mp3|media/music/bomberman_collect.ogg'},
        {data: 8, id: 'wrong', src: 'resources/sound/bomberman_collect_wrong.mp3|media/music/bomberman_collect_wrong.ogg'},
        {data: 8, id: 'bonus', src: 'resources/sound/bomberman_bonus.mp3|media/music/bomberman_bonus.ogg'},
        {data: 30, id: 'bombsound', src: 'resources/sound/bomberman_bomb.mp3|media/music/bomberman_bomb.ogg'},
        {data: 8, id: 'die', src: 'resources/sound/bomberman_die.mp3|media/music/bomberman_die.ogg'}
      ]);
    } else {
      this.startGame();
    }
  },

  startGame: function () {
    this.stage = new createjs.Stage(this.canvas);
    createjs.Touch.enable(this.stage);

    var nrPlayers = 1;

    // If we are not on a small screen
    if (this.nrTilesWidth > this.nrTilesHeight) {
      nrPlayers = 2;
    }

    this.input.removeListeners( 'pause');

    var menu = new Menu( ['Bomber Girl'], nrPlayers, this.nrTilesWidth, this.nrTilesHeight, this.images);
    this.stage.addChild( menu.content);

    var self = this;
    menu.onSinglePlayer( function () {
      createjs.Sound.play('correct').setVolume(0.7);
      self.stage.removeAllChildren();
      self.cleanUp();

      self.nrPlayers = 1;
      self.initGame();
      self.scale();
      self.initEvents();

      // bring the notifications area into view
      self.notificationsArea.style.top = '0';

      // hide the cursor
      self.canvas.style.cursor = 'none';

      setTimeout( function () {
        document.addEventListener( 'touchstart', self.onTouchStart);
        document.addEventListener( 'touchmove', self.onTouchMove);
        document.addEventListener( 'touchend', self.onTouchEnd);
      }, 500);
    });

    if (this.nrTilesWidth > this.nrTilesHeight) {
      // Add the listener for the multiplayer button only if there's enough space on the screen for multiplayer gameplay
      menu.onMultiPlayer( function () {
        createjs.Sound.play('correct').setVolume(0.7);
        self.stage.removeAllChildren();
        self.cleanUp();

        self.nrPlayers = 2;
        self.initGame();
        self.scale();
        self.initEvents();

        // bring the notifications area into view
        self.notificationsArea.style.top = '0';

        // hide the cursor
        self.canvas.style.cursor = 'none';

        setTimeout( function () {
          document.addEventListener( 'touchstart', self.onTouchStart);
          document.addEventListener( 'touchmove', self.onTouchMove);
          document.addEventListener( 'touchend', self.onTouchEnd);
        }, 500);
      });
    }

    // scale the game before appending it to the DOM, otherwise a bug would occur on chrome
    this.scale();

    // The canvas element must be inserted before the notifications area for proper display
    try {
      document.getElementById( 'renderBox').insertBefore( this.canvas, this.notificationsArea);
    } catch (e) {
      document.getElementById( 'renderBox').appendChild( this.canvas);
    }

    createjs.Ticker.setFPS( 60);
    createjs.Ticker.addEventListener('tick', function () {
      // Set the ticker because the menu contains 2 animation images
      self.stage.update();
    });

    if (!this.soundtrackStarted) {
      if (this.quited) {
        createjs.Sound.setMute(false);
        this.mute = false;
        this.quited = false;
      }

      this.soundtrack = createjs.Sound.play('game', 'none', 0, 0, -1);
      this.soundtrack.setVolume(0.5);
      this.soundtrackStarted = true;
    }
  },

  initGame: function () {
    this.showingOff = false;

    this.tiles = new Array( this.nrTilesWidth + 2);
    for (var i = 0; i < this.tiles.length; i++) {
      this.tiles[i] = new Array( this.nrTilesHeight + 2);
    }

    var map = [
      [ null, null, 'wood', 'wood', 'wood', 'wood', 'wood', 'wood', 'wood', 'wood', 'wood', 'wood', 'wood', 'wood', 'wood', null, null],
      [ null, 'wall', 'wood', 'wall', 'wood', 'wall', 'wood', 'wall', 'wood', 'wall', 'wood', 'wall', 'wood', 'wall', 'wood', 'wall', null],
      [ 'wood', 'wood', 'wood', 'wood', 'wood', 'wood', 'wood', 'wood', 'wood', 'wood', 'wood', 'wood', 'wood', 'wood', 'wood', 'wood', 'wood'],
      [ 'wood', 'wall', 'wood', 'wall', 'wood', 'wall', 'wood', 'wall', 'wood', 'wall', 'wood', 'wall', 'wood', 'wall', 'wood', 'wall', 'wood'],
      [ 'wood', 'wood', 'wood', 'wood', 'wood', 'wood', 'wood', 'wood', 'wood', 'wood', 'wood', 'wood', 'wood', 'wood', 'wood', 'wood', 'wood'],
      [ 'wood', 'wall', 'wood', 'wall', 'wood', 'wall', 'wood', 'wall', 'wood', 'wall', 'wood', 'wall', 'wood', 'wall', 'wood', 'wall', 'wood'],
      [ 'wood', 'wood', 'wood', 'wood', 'wood', 'wood', 'wood', 'wood', 'wood', 'wood', 'wood', 'wood', 'wood', 'wood', 'wood', 'wood', 'wood'],
      [ 'wood', 'wall', 'wood', 'wall', 'wood', 'wall', 'wood', 'wall', 'wood', 'wall', 'wood', 'wall', 'wood', 'wall', 'wood', 'wall', 'wood'],
      [ 'wood', 'wood', 'wood', 'wood', 'wood', 'wood', 'wood', 'wood', 'wood', 'wood', 'wood', 'wood', 'wood', 'wood', 'wood', 'wood', 'wood'],
      [ 'wood', 'wall', 'wood', 'wall', 'wood', 'wall', 'wood', 'wall', 'wood', 'wall', 'wood', 'wall', 'wood', 'wall', 'wood', 'wall', 'wood'],
      [ 'wood', 'wood', 'wood', 'wood', 'wood', 'wood', 'wood', 'wood', 'wood', 'wood', 'wood', 'wood', 'wood', 'wood', 'wood', 'wood', 'wood'],
      [ null, 'wall', 'wood', 'wall', 'wood', 'wall', 'wood', 'wall', 'wood', 'wall', 'wood', 'wall', 'wood', 'wall', 'wood', 'wall', null],
      [ null, null, 'wood', 'wood', 'wood', 'wood', 'wood', 'wood', 'wood', 'wood', 'wood', 'wood', 'wood', 'wood', 'wood', null, null]
    ];

    for ( var i = 0; i < 6; i++) {
      map[Utils.getRandomInt(4, map.length - 3)][Utils.getRandomInt(4, map[0].length - 3)] = 'wall';
    }

    //this.oaOperands = ap.operands;
    this.oaNumbers = [];

    this.createWoods( map);
    this.createBonuses();

    this.createWalls( map);
    this.createBorders();

    this.createNotificationsArea();
    this.createBots();
    this.createPlayers();

    this.buildRewardMap();
    this.buildDangerMap();
    this.buildAuxDangerMap();
  },

  createWoods: function ( map) {
    this.woodsPositions = [];

    var tilesOnHeight = this.nrTilesHeight;
    var tilesOnWidth = this.nrTilesWidth;

    var i, j, tall = false;

    if ( tilesOnHeight > tilesOnWidth) {
      tall = true;
    }

    for ( j = 0; j < tilesOnHeight; j++ ) {
      for ( i = 0; i < tilesOnWidth; i++) {
        if ( !tall && map[j][i] === 'wood') {
          var wood = new Wood( this.images['wood'], {x: i + 1, y: j + 1});

          this.tiles[i + 1][j + 1] = wood;
          this.stage.addChild( wood.bmp);

          this.woodsPositions.push({x: i + 1, y: j + 1});
        } else if ( tall && map[i][j] === 'wood') {
          var wood = new Wood( this.images['wood'], {x: i + 1, y: j + 1});

          this.tiles[i + 1][j + 1] = wood;
          this.stage.addChild( wood.bmp);

          this.woodsPositions.push({x: i + 1, y: j + 1});
        }
      }
    }
  },

  createBonuses: function () {
    var bonusesCount = Math.round(this.woodsPositions.length * this.bonusesPercent * 0.01 / 4);
    this.woodsPositions.sort(function () {
      return 0.2 - Math.random();
    });

    for (var j = 0; j < 4; j++) {
      var count = 0;
      for (var i = 1; i < this.woodsPositions.length; i += 4) {
        if (count > bonusesCount) {
          break;
        }

        var woodPos = this.woodsPositions[i];
        if ((j == 0 && woodPos.x < this.nrTilesWidth / 2 && woodPos.y < this.nrTilesHeight / 2) ||
          (j == 1 && woodPos.x < this.nrTilesWidth / 2 && woodPos.y > this.nrTilesHeight / 2) ||
          (j == 2 && woodPos.x > this.nrTilesWidth / 2 && woodPos.y < this.nrTilesHeight / 2) ||
          (j == 3 && woodPos.x > this.nrTilesWidth / 2 && woodPos.y > this.nrTilesWidth / 2)) {

          var typePercentage = Math.floor(Math.random() * 100);
          var typeNr;
          if (typePercentage < 20) {
            typeNr = 0;  // speed
          } else if (typePercentage < 60) {
            typeNr = 1;  // bomb
          } else {
            typeNr = 2;  // fire
          }

          var bonusType = this.bonusTypes[typeNr];
          var bonus = new Bonus( woodPos, bonusType, this.images[bonusType]);

          this.bonuses.push(bonus);
          this.stage.addChildAt(bonus.bmp, 0);

          count++;
        }
      }
    }
  },

  createWalls: function ( map) {

    var tall = false;

    var tilesOnHeight = this.nrTilesHeight;
    var tilesOnWidth = this.nrTilesWidth;

    if ( tilesOnHeight > tilesOnWidth) {
      tall = true;
    }

    var i,j;

    for ( j = 0; j < tilesOnHeight; j++) {
      for ( i = 0; i < tilesOnWidth; i++) {
        if ( !tall && map[j][i] === 'wall') {
          var wall = new Wall( {x: i + 1, y: j + 1}, this.images['wall']);

          this.tiles[i + 1][j + 1] = wall;
          this.stage.addChild(wall.bmp);
        } else if ( tall && map[i][j] === 'wall') {
          var wall = new Wall( {x: i + 1, y: j + 1}, this.images['wall']);

          this.tiles[i + 1][j + 1] = wall;
          this.stage.addChild(wall.bmp);
        }

      }
    }
  },

  createBorders: function () {
    // + 2 for the exterior ,invisible, walls (the ones outside the game area)
    tilesOnHeight = this.nrTilesHeight + 2;
    tilesOnWidth = this.nrTilesWidth + 2;

    // Create the outer, invisible, walls
    for (var leftright = 0; leftright < tilesOnHeight; leftright++) {
      // the left wall
      wall = new Wall( {x: 0, y: leftright});
      this.tiles[0][leftright] = wall;

      // the right wall
      wall = new Wall( {x: tilesOnWidth - 1, y: leftright});
      this.tiles[tilesOnWidth - 1][leftright] = wall;
    }

    for (var updown = 0; updown < tilesOnWidth; updown++) {
      // the upper wall
      wall = new Wall( {x: updown, y: 0});
      this.tiles[updown][0] = wall;

      // the lower wall
      wall = new Wall( {x: updown, y: tilesOnHeight - 1});
      this.tiles[updown][tilesOnHeight - 1] = wall;
    }
  },

  /**
  * @author Gabriel Titerlea
  *
  * Todo: the players may collect some special bonuses for more points in the future
  */
  createOANumbers: function () {
    var owner  = 1;
    var color = this.yellow;

    this.makeOANumber( 0, 3, 3, color, owner);
    this.makeOANumber( 1, this.nrTilesWidth - 2, 3, color, owner);
    if (this.nrTilesWidth > this.nrTilesHeight) {
      this.makeOANumber( 2, 7, 5, color, owner);
      this.makeOANumber( 3, 11, 5, color, owner);
    } else {
      this.makeOANumber( 3, 5, 7, color, owner);
      this.makeOANumber( 3, 9, 7, color, owner);
    }
    this.makeOANumber( 9, Math.floor(this.nrTilesWidth / 2) + 1, 2, color, owner);

    if (this.nrPlayers === 2) {
      owner = 2;
      color = this.red;
    }

    this.makeOANumber( 5, 3, this.nrTilesHeight - 2, color, owner);
    this.makeOANumber( 6, this.nrTilesWidth - 2, this.nrTilesHeight - 2, color, owner);
    if (this.nrTilesWidth > this.nrTilesHeight) {
      this.makeOANumber( 7, 7, this.nrTilesHeight - 4, color, owner);
      this.makeOANumber( 8, 11, this.nrTilesHeight - 4, color, owner);
    } else {
      this.makeOANumber( 7, 5, this.nrTilesHeight - 6, color, owner);
      this.makeOANumber( 8, 9, this.nrTilesHeight - 6, color, owner);
    }
    this.makeOANumber( 4, Math.floor(this.nrTilesWidth / 2) + 1, this.nrTilesHeight - 1, color, owner);

    // set the order in which player 1 will collect numbers
    var order = Math.round(Math.random());
    switch (order) {
    case 0:
      this.correctNumbers1.sort( function ( a, b) {
        return a > b;
      });
      this.numberOrder1 = '(asc)';
      break;
    case 1:
      this.correctNumbers1.sort( function ( a, b) {
        return a < b;
      });
      this.numberOrder1 = '(desc)';
      break;
    }

    // set the order in which player 2 will collect numbers
    order = Math.round(Math.random());
    switch (order) {
    case 0:
      this.correctNumbers2.sort( function ( a, b) {
        return a > b;
      });
      this.numberOrder2 = '(asc)';
      break;
    case 1:
      this.correctNumbers2.sort( function ( a, b) {
        return a < b;
      });
      this.numberOrder2 = '(desc)';
      break;
    }
  },

  makeOANumber: function ( numberIndex, gridPosX, gridPosY, color, owner) {
    this['correctNumbers' + owner].push(this.oaOperands[numberIndex]);
    var number = new OANumber( this.oaOperands[numberIndex], color, {x: gridPosX, y: gridPosY}, owner);

    this.oaNumbers.push(number);

    // the hidden bg is only seen when there is no wood on the number position
    // making the number look like it's glowing
    this.stage.addChildAt(number.hiddenBG, 0);
    this.stage.addChild(number.bg);
    this.stage.addChild(number.txt);
  },

  createNotificationsArea: function () {
    this.notificationsArea = dom.createDiv( 'bomberman_notifications');
    var notificationsAreaForeground = dom.createDiv();
    this.notificationsArea.appendChild(notificationsAreaForeground);

    this.playerNotification1 = dom.createSpan( 'bomberman_p1_score', '', this.numberOrder1);
    this.notificationsArea.appendChild(this.playerNotification1);

    if (this.nrPlayers === 2) {
      this.playerNotification2 = dom.createSpan( 'bomberman_p2_score', '', this.numberOrder2);
      this.notificationsArea.appendChild(this.playerNotification2);
    }

    document.getElementById( 'renderBox').appendChild( this.notificationsArea);

    this.pausedIndicator = dom.createSpan( 'pausedIndicator', '', 'Paused');
    document.getElementById( 'renderBox').appendChild( this.pausedIndicator);
  },

  createBots: function () {
    var bot1 = new Bot( this.images['george'], this.images['shadow'], {x: this.nrTilesWidth, y: 1});
    this.stage.addChild( bot1.shadow);
    this.stage.addChild(bot1.bmp);

    this.bots.push(bot1);

    var bot2 = new Bot( this.images['george2'], this.images['shadow'], {x: 1, y: this.nrTilesHeight});
    this.stage.addChild( bot2.shadow);
    this.stage.addChild(bot2.bmp);

    this.bots.push(bot2);

    if (this.nrPlayers !== 2) {
      var bot3 = new Bot( this.images['george3'], this.images['shadow'], {x: this.nrTilesWidth, y: this.nrTilesHeight});
      this.stage.addChild( bot3.shadow);
      this.stage.addChild(bot3.bmp);

      this.bots.push(bot3);
    }
  },

  createPlayers: function () {
    var player1 = new Player( this.images['betty'], this.images['shadow'], {x: 1, y: 1}, 1);
    this.stage.addChild( player1.shadow);
    this.stage.addChild( player1.bmp);

    this.player1 = player1;
    this.players.push( player1);

    if (this.nrPlayers === 2) {
      var player2 = new Player( this.images['betty2'], this.images['shadow'], {x: this.nrTilesWidth, y: this.nrTilesHeight}, 2);
      this.stage.addChild( player2.shadow);
      this.stage.addChild( player2.bmp);

      this.player2 = player2;
      this.players.push( player2);
    }
  },

  buildRewardMap: function () {
    var i, j;
    var width = this.nrTilesWidth + 2;
    var height = this.nrTilesHeight + 2;

    this.rewardMap = [];
    for ( i = 0; i < width; i++) {
      this.rewardMap[i] = [];
      for ( j = 0; j < height; j++) {
        if ( this.tiles[i][j] && ((this.tiles[i][j] instanceof Wall) || (this.tiles[i][j] instanceof Wood) || (this.tiles[i][j] instanceof Bomb))) {
          this.rewardMap[i][j] = -1;
        } else {
          this.rewardMap[i][j] = 0;
        }
      }
    }
  },

  buildDangerMap: function () {
    var i;
    var width = this.nrTilesWidth + 2;
    var height = this.nrTilesHeight + 2;

    this.dangerMap = [];
    for ( i = 0; i < width; i++) {
      this.dangerMap[i] = [];
      for ( var j = 0; j < height; j++) {
        this.dangerMap[i][j] = 0;
      }
    }
  },

  buildAuxDangerMap: function () {
    this.auxDangerMap = [];

    var width = this.nrTilesWidth + 2;
    var height = this.nrTilesHeight + 2;

    for ( var i = 0; i < width; i++) {
      this.auxDangerMap[i] = [];
    }
  },

  initEvents: function () {
    this.input.addListener( 'pause', this.togglePause);
    createjs.Ticker.addEventListener( 'tick', this.update);
  },

  togglePause: function () {
    var self = Bombergirl;

    if (self.paused) {
      self.manualPaused = false;
      self.unPause();
    } else {
      self.pause();
      self.manualPaused = true;
    }
  },

  unPause: function () {
    var self = Bombergirl;

    if (self.manualPaused) {
      return;
    }

    createjs.Ticker.removeAllEventListeners();

    if (self.paused) {
      if (!self.mute) {
        createjs.Sound.setMute(false);
      }

      // Add the tick listener back so that objects can move
      if ( !self.showingOff) {
        createjs.Ticker.addEventListener('tick', self.update);
      }
      self.paused = false;

      try {
        self.canvas.style.opacity = '1';
        self.notificationsArea.style.opacity = '1';
        self.pausedIndicator.style.display = 'none';
      } catch (e) {}
    }
  },

  pause: function () {
    var self = Bombergirl;

    if (self.manualPaused) {
      return;
    }

    if (!self.paused) {
      if (!self.mute) {
        createjs.Sound.setMute(true);
      }

      // Removing the ticker listener
      createjs.Ticker.removeAllEventListeners();
      self.paused = true;

      // cancel all input commands so that when unpausing the game
      // players will not move in the last direction given
      self.input.cancelAll();

      try {
        self.canvas.style.opacity = '0.6';
        self.notificationsArea.style.opacity = '0.6';
        self.pausedIndicator.style.display = 'block';
      } catch (e) {}
    }
  },

  toggleSound: function () {
    var self = Bombergirl;
    if (!self.paused) {
      createjs.Sound.setMute(!createjs.Sound.getMute());

      self.mute = createjs.Sound.getMute();
    }
  },

  /**
   * @author Gabriel Titerlea
   *
   * is called on every tick
   * */
  update: function () {
    var self = Bombergirl;

    self.processInput();
    self.collisionHandling();
    self.botsThink();
    self.animateObjects();
    self.endGame();
  },

  processInput: function () {
    // for each controllable player
    for (var i = 1; i <= this.nrPlayers; i++) {
      // check movement input
      if (this.input.actions['up' + i] === true) {

        this['player' + i].move( Direction.UP);
      } else if (this.input.actions['down' + i] === true) {

        this['player' + i].move( Direction.DOWN);
      } else if (this.input.actions['left' + i] === true) {

        this['player' + i].move( Direction.LEFT);
      } else if (this.input.actions['right' + i] === true) {

        this['player' + i].move( Direction.RIGHT);
      } else {

        this['player' + i].move( Direction.NONE);
      }

      // check bomb input
      if (this.input.actions['bomb' + i] === true) {
        var bomb = this['player' + i].placeBomb( this.images['bomb'], this.images['shadow']);
        if (bomb) {
          this.bombs.push(bomb);
          this.tiles[bomb.gridPosition.x][bomb.gridPosition.y] = bomb;

          for (var k = 0; k < this.players.length; k++) {
            var playerEsc = this.players[k];
            var pGridPos =  Utils.convertToGridPosition(playerEsc.position);

            if (pGridPos.x === bomb.gridPosition.x && pGridPos.y === bomb.gridPosition.y) {
              playerEsc.escapeBomb = bomb;
            }
          }

          this.stage.addChildAt(bomb.bmp, 0);
          this.stage.addChildAt(bomb.shadow, 0);
        }

        if (this.touch) {
          this.input.actions['bomb' + i] = false;
        }
      }

    }
  },

  collisionHandling: function () {

    for (var i = 0; i < this.players.length; i++) {
      var player = this.players[i];

      this.tileCollision( player);
      if ( !player.dead) {
        this.bonusCollision( player);
        // this.OANumbersCollision( this['player' + (i + 1)]);
        this.playerFireCollision( player);
      }
    }

    for (var i = 0; i < this.bots.length; i++) {
      var bot = this.bots[i];

      this.botFireCollision( bot);
      this.bonusCollision( bot);
    }
  },

  tileCollision: function ( player) {
    // check wall collision only if the player is moving
    if ( player.direction !== Direction.NONE) {

      var collision = false;
      player.willCollide = false;

      // auxiliary position, to see if moving will cause a collision
      var auxPlayerPos = {
        x: player.position.x,
        y: player.position.y
      };
      // make the auxiliary move
      auxPlayerPos.x += player.direction.x * player.speed;
      auxPlayerPos.y += player.direction.y * player.speed;

      var playerGridPos = Utils.convertToGridPosition( auxPlayerPos);

      // iterate in a spiral, the tiles in the vicinity of the player to check for collision
      var x = playerGridPos.x;
      var y = playerGridPos.y;
      if (this.checkCollision( x - 1, y - 1, player, auxPlayerPos)) { collision = true;}
      if (this.checkCollision( x, y - 1, player, auxPlayerPos)) { collision = true;}
      if (this.checkCollision( x + 1, y - 1, player, auxPlayerPos)) { collision = true;}
      if (this.checkCollision( x + 1, y, player, auxPlayerPos)) { collision = true;}
      if (this.checkCollision( x + 1, y + 1, player, auxPlayerPos)) { collision = true;}
      if (this.checkCollision( x, y + 1, player, auxPlayerPos)) { collision = true;}
      if (this.checkCollision( x - 1, y + 1, player, auxPlayerPos)) { collision = true;}
      if (this.checkCollision( x - 1, y, player, auxPlayerPos)) { collision = true;}
      if (this.checkCollision( x, y, player, auxPlayerPos)) { collision = true;}

      if (!collision) {
        // if there was no collision it means we have escaped the escapeBomb, if there was one
        player.escapeBomb = null;
      }
    }
  },

  checkCollision: function ( i, j, player, auxPlayerPos) {
    var collision = false;
    var tile = this.tiles[i][j];

    if (tile && Utils.intersectPlayerAndTile( auxPlayerPos, tile.position)) {

      if (tile !== player.escapeBomb) {
        player.willCollide = true;

        // --- CORNER FIX --- //
        var auxPlayerPosFix = { x: auxPlayerPos.x, y: auxPlayerPos.y};

        if (player.direction === Direction.UP) {
          auxPlayerPosFix.x -= 27;
          if (!this.tiles[i - 1][j] && (!this.tiles[i - 1][j + 1] || this.tiles[i - 1][j + 1] === player.escapeBomb) && !Utils.intersectPlayerAndTile(auxPlayerPosFix, tile.position)) { // if the tile is empty we can move there
            player.move( Direction.LEFT, true);
            player.willCollide = false;
          }

          auxPlayerPosFix.x += 54;
          if (!this.tiles[i + 1][j] && (!this.tiles[i + 1][j + 1] || this.tiles[i + 1][j + 1] === player.escapeBomb) && !Utils.intersectPlayerAndTile(auxPlayerPosFix, tile.position)) { // if the tile is empty we can move there
            player.move( Direction.RIGHT, true);
            player.willCollide = false;
          }

        } else if (player.direction === Direction.DOWN) {
          auxPlayerPosFix.x -= 27;
          if (!this.tiles[i - 1][j] && (!this.tiles[i - 1][j - 1] || this.tiles[i - 1][j - 1] === player.escapeBomb) && !Utils.intersectPlayerAndTile(auxPlayerPosFix, tile.position)) { // if the tile is empty we can move there
            player.move( Direction.LEFT, true);
            player.willCollide = false;
          }

          auxPlayerPosFix.x += 54;
          if (!this.tiles[i + 1][j] && (!this.tiles[i + 1][j - 1] || this.tiles[i + 1][j - 1] === player.escapeBomb) && !Utils.intersectPlayerAndTile(auxPlayerPosFix, tile.position)) { // if the tile is empty we can move there
            player.move( Direction.RIGHT, true);
            player.willCollide = false;
          }
        } else if (player.direction === Direction.LEFT) {
          auxPlayerPosFix.y -= 27;
          if (!this.tiles[i][j - 1] && (!this.tiles[i + 1][j - 1] || this.tiles[i + 1][j - 1] === player.escapeBomb) && !Utils.intersectPlayerAndTile(auxPlayerPosFix, tile.position)) { // if the tile is empty we can move there
            player.move( Direction.UP, true);
            player.willCollide = false;
          }

          auxPlayerPosFix.y += 54;
          if (!this.tiles[i][j + 1] && (!this.tiles[i + 1][j + 1] || this.tiles[i + 1][j + 1] === player.escapeBomb) && !Utils.intersectPlayerAndTile(auxPlayerPosFix, tile.position)) { // if the tile is empty we can move there
            player.move( Direction.DOWN, true);
            player.willCollide = false;
          }
        } else if (player.direction === Direction.RIGHT) {
          auxPlayerPosFix.y -= 27;
          if (!this.tiles[i][j - 1] && (!this.tiles[i - 1][j - 1] || this.tiles[i - 1][j - 1] === player.escapeBomb) && !Utils.intersectPlayerAndTile(auxPlayerPosFix, tile.position)) { // if the tile is empty we can move there
            player.move( Direction.UP, true);
            player.willCollide = false;
          }

          auxPlayerPosFix.y += 54;
          if (!this.tiles[i][j + 1] && (!this.tiles[i - 1][j + 1] || this.tiles[i - 1][j + 1] === player.escapeBomb) && !Utils.intersectPlayerAndTile(auxPlayerPosFix, tile.position)) { // if the tile is empty we can move there
            player.move( Direction.DOWN, true);
            player.willCollide = false;
          }
        }
      }

      collision = true;
    }

    return collision;
  },

  bonusCollision: function ( player) {

    var i = this.bonuses.length;
    while (i--) {
      var bonus = this.bonuses[i];
      if ( Utils.intersectPlayerAndTile( player.position, bonus.position)) {
        player.applyBonus( bonus);

        // if this is not a bot
        if (player.id && player.id === 1) {
          player.score += 10;
          this['playerNotification' + player.id].innerHTML = player.score;
        } else if (player.id && player.id === 2) {
          player.score += 10;
          this['playerNotification' + player.id].innerHTML = player.score;
        }

        createjs.Sound.play('bonus').setVolume(0.6);

        // remove bonus from reward map
        this.spreadRewards( bonus, true);

        this.stage.removeChild(bonus.bmp);
        this.bonuses.splice(i, 1);
      }
    }

    this.calculateRewardMap();
  },

  /**
   * @author Gabriel Titerlea
   *
   * Handles the collision of the players with the OANumbers
   * */
  OANumbersCollision: function (player) {
    if (player) {
      var i = this.oaNumbers.length;
      while (i--) {
        var oaNumber = this.oaNumbers[i];
        if ( Utils.intersectPlayerAndTile(player.position, oaNumber.position)) {

          // if this OANumber belongs to this player
          if (oaNumber.owner === player.id) {
            if (this['correctNumbers' + player.id][0] === oaNumber.nr) {
              createjs.Sound.play('correct').setVolume(0.5);
              player.score += 100 + player.streak;
              player.streak += 50;
            } else {
              createjs.Sound.play('wrong').setVolume(0.5);
              player.score -= 50;
              player.streak = 0;

              if (player.score < 0) {
                player.score = 0;
              }
            }
          } else {
            createjs.Sound.play('correct').setVolume(0.5);
            player.score += 15;
          }

          // update the notifications area
          if (player.id === 1) {
            this['playerNotification' + player.id].innerHTML = player.score + ' ' + this['numberOrder' + player.id];
          } else if (player.id === 2) {
            this['playerNotification' + player.id].innerHTML = this['numberOrder' + player.id] + ' ' + player.score;
          }

          // remove the collected number from the array
          var n = this['correctNumbers' + oaNumber.owner].length;
          while (n--) {
            if (this['correctNumbers' + oaNumber.owner][n] === oaNumber.nr) {
              this['correctNumbers' + oaNumber.owner].splice(n, 1);
            }
          }

          this.stage.removeChild(oaNumber.txt);
          this.stage.removeChild(oaNumber.bg);
          this.stage.removeChild(oaNumber.hiddenBG);
          this.oaNumbers.splice(i, 1);
        }
      }
    }
  },

  playerFireCollision: function ( player) {
    var gridPosition = Utils.convertToGridPosition( player.position);

    for (var i = 0; i < this.fires.length; i++) {
      if ( this.fires[i].gridPosition.x === gridPosition.x && this.fires[i].gridPosition.y === gridPosition.y) {
        createjs.Sound.play('die').setVolume(0.2);

        player.fade();
        player.dead = true;
      }
    }
  },

  botFireCollision: function ( bot) {
    var gridPosition = bot.gridPosition;

    for (var i = 0; i < this.fires.length; i++) {
      if ( this.fires[i].gridPosition.x === gridPosition.x && this.fires[i].gridPosition.y === gridPosition.y) {
        createjs.Sound.play('die').setVolume(0.2);

        bot.fade( function () {
          this.stage.removeChild( bot.bmp);
          this.stage.removeChild( bot.shadow);
        }.bind(this));

        bot.dead = true;

        // delete the bot
        var b = this.bots.length;
        while (b--) {
          if (this.bots[b] === bot) {
            this.bots.splice(b, 1);
          }
        }
      }
    }
  },

  // ****************######################********************

  dangerMap: null,
  rewardMap: null,

  botsThink: function () {
    // used to make sure the method calculateDangerMap is executed only once
    var uniqueCallFlag = false;

    for (var i = 0; i < this.bots.length; i++) {
      var bot = this.bots[i];

      // the bot has reached its destination
      if (bot.position.x === bot.destination.x && bot.position.y === bot.destination.y) {

        bot.nearPlayer = this.playerIsInVicinity( bot);

        this.calculateDangerMap( uniqueCallFlag);
        uniqueCallFlag = true;

        this.searchForSafeDirections( bot, this.dangerMap, 4);

        // if the bot is in danger
        if ( this.dangerMap[ bot.gridPosition.x][ bot.gridPosition.y]) {

          if ( this.safeDirections.length > 0) {

            var bestDirs = 0;
            while ( bestDirs < this.safeDirections.length && this.safeDirections[bestDirs].steps === 0) {
              bestDirs++;
            }
            var dir = Utils.getRandomInt( 0, bestDirs);

            var destination = {
              x: bot.gridPosition.x + this.safeDirections[dir].dir.x,
              y: bot.gridPosition.y + this.safeDirections[dir].dir.y
            };
            bot.setDestination( destination);
          } else {
            bot.setDestination( bot.gridPosition);
          }

        } else {

          // if near fire, stay put
          if ( this.safeDirections.length > 0 && this.safeDirections[0].steps > 0) {
            bot.setDestination( bot.gridPosition);
          } else if ( this.safeDirections.length > 0) {
            if ( bot.nearPlayer || bot.nearWood) {

              var bestDirs = 0;
              while ( bestDirs < this.safeDirections.length && this.safeDirections[bestDirs].steps === 0) {
                bestDirs++;
              }
              var dir = Utils.getRandomInt( 0, bestDirs);

              var destination = {
                x: bot.gridPosition.x + this.safeDirections[dir].dir.x,
                y: bot.gridPosition.y + this.safeDirections[dir].dir.y
              };

              var auxDangerMap = this.placeAuxBomb( bot, this.dangerMap);
              this.searchForSafeDirections( bot, auxDangerMap, 2);

              if ( this.safeDirections.length > 0) {
                this.placeBomb( bot);

                bestDirs = 0;
                while ( bestDirs < this.safeDirections.length && this.safeDirections[bestDirs].steps === 0) {
                  bestDirs++;
                }
                dir = Utils.getRandomInt( 0, bestDirs);

                destination = {
                  x: bot.gridPosition.x + this.safeDirections[dir].dir.x,
                  y: bot.gridPosition.y + this.safeDirections[dir].dir.y
                };
              }
              bot.setDestination( destination);
            } else {
              this.moveTowardsBonusOrPlayer( bot);
            }
          } else {
            bot.setDestination( bot.gridPosition);
          }
        }
      }
    }
  },

  calculateDangerMap: function ( called) {
    if ( !called) {

      var i;
      var width = this.nrTilesWidth + 2;
      var height = this.nrTilesHeight + 2;

      for ( i = 0; i < width; i++) {
        for ( var j = 0; j < height; j++) {
          this.dangerMap[i][j] = 0;
        }
      }

      for ( i = 0; i < this.bombs.length; i++) {
        var bombDangerPositions = this.bombs[i].getDangerPositions( this.tiles);

        for (var f = 0; f < bombDangerPositions.length; f++) {
          this.dangerMap[ bombDangerPositions[f].x][ bombDangerPositions[f].y] = 1;
        }
      }

      for ( i = 0; i < this.fires.length; i++) {
        var fire = this.fires[i];

        this.dangerMap[ fire.gridPosition.x][ fire.gridPosition.y] = 2;
      }
    }
  },

  playerIsInVicinity: function ( bot) {
    var range = gSize * 3;

    for ( var i = 0; i < this.players.length; i++) {
      if ( !this.players[i].dead) {
        var distanceX = Math.abs( this.players[i].position.x - bot.position.x);
        var distanceY = Math.abs( this.players[i].position.y - bot.position.y);

        if ( distanceX < range && distanceY < range) {
          return true;
        }
      }
    }

    return false;
  },

  auxDangerMap: null,

  placeAuxBomb: function ( bot, dangerMap) {

    var width = this.nrTilesWidth + 2;
    var height = this.nrTilesHeight + 2;

    for ( var i = 0; i < width; i++) {
      for ( var j = 0; j < height; j++) {
        this.auxDangerMap[i][j] = dangerMap[i][j];
      }
    }

    var bomb = new Bomb( this.images['bomb'], this.images['sadow'], bot.gridPosition, 1, 0);
    var dangerPositions = bomb.getDangerPositions( this.tiles);

    for ( var i = 0; i < dangerPositions.length; i++) {
      var danger = dangerPositions[i];

      this.auxDangerMap[danger.x][danger.y] = 1;
    }

    return this.auxDangerMap;
  },

  safeDirections: [],
  directionQueue: [],

  searchForSafeDirections: function ( bot, dangerMap, limit) {

    bot.nearWood = false;

    this.safeDirections = [];
    this.directionQueue = [];

    var directions = [ Direction.UP, Direction.DOWN, Direction.LEFT, Direction.RIGHT];

    for ( var i = 0; i < directions.length; i++) {
      var direction = directions[i];

      var x = bot.gridPosition.x + direction.x;
      var y = bot.gridPosition.y + direction.y;

      if ( !this.tiles[x][y]) {
        if ( dangerMap[x][y] === 0) {
          this.safeDirections.push( {dir: direction, steps: 0});
        } else if ( dangerMap[x][y] === 1) {
          this.directionQueue.push( {
            position: { x: x, y: y},
            initialDir: direction,
            lastDir: direction,
            steps: 1
          });
        }
      } else if ( this.tiles[x][y] instanceof Wood) {
        bot.nearWood = true;
      }
    }

    if ( this.safeDirections.length === 0) {
      while (this.directionQueue.length > 0) {
        var possibility = this.directionQueue.shift();
        this.keepSearchingSafeDirs( dangerMap, possibility.position, possibility.initialDir, possibility.lastDir, possibility.steps, limit);
      }
    }
  },

  keepSearchingSafeDirs: function ( dangerMap, position, initialDir, lastDir, steps, limit) {

    if ( steps >= limit) {
      return;
    }
    var i;

    var directions = [ Direction.UP, Direction.DOWN, Direction.LEFT, Direction.RIGHT];

    for ( i = 0; i < directions.length; i++) {
      var direction = directions[i];

      if ( lastDir.opposite == direction.name) {
        continue;
      }

      var x = position.x + direction.x;
      var y = position.y + direction.y;

      if ( !this.tiles[x][y]) {
        if ( dangerMap[x][y] === 0) {
          this.safeDirections.push( {dir: initialDir, steps: steps});
        } else if (dangerMap[x][y] === 1) {
          this.directionQueue.push( {
            position: { x: x, y: y},
            initialDir: initialDir,
            lastDir: direction,
            steps: steps + 1
          });
        }
      }
    }
  },

  placeBomb: function ( bot) {

    var bomb = bot.placeBomb( this.images['bomb'], this.images['shadow']);
    if (bomb) {
      this.bombs.push(bomb);
      this.tiles[bomb.gridPosition.x][bomb.gridPosition.y] = bomb;

      for (var k = 0; k < this.players.length; k++) {
        var playerEsc = this.players[k];
        var pGridPos = Utils.convertToGridPosition(playerEsc.position);

        if (pGridPos.x === bomb.gridPosition.x && pGridPos.y === bomb.gridPosition.y) {
          playerEsc.escapeBomb = bomb;
        }

        if (pGridPos.x === bomb.gridPosition.x + 1 && pGridPos.y === bomb.gridPosition.y) {
          if (playerEsc.escapeBomb === null) {
            playerEsc.escapeBomb = bomb;
          }
        }
        if (pGridPos.x === bomb.gridPosition.x - 1 && pGridPos.y === bomb.gridPosition.y) {
          if (playerEsc.escapeBomb === null) {
            playerEsc.escapeBomb = bomb;
          }
        }
        if (pGridPos.x === bomb.gridPosition.x && pGridPos.y === bomb.gridPosition.y + 1) {
          if (playerEsc.escapeBomb === null) {
            playerEsc.escapeBomb = bomb;
          }
        }
        if (pGridPos.x === bomb.gridPosition.x && pGridPos.y === bomb.gridPosition.y - 1) {
          if (playerEsc.escapeBomb === null) {
            playerEsc.escapeBomb = bomb;
          }
        }
      }

      this.stage.addChildAt(bomb.bmp, 0);
      this.stage.addChildAt(bomb.shadow, 0);
    }
  },

  moveTowardsBonusOrPlayer: function ( bot) {

    var closestPlayer = this.getClosestPlayerPos( bot);
    var distance = 9999;
    var playerDestination = bot.gridPosition;
    var toPlayer = false;

    var bonusDestination = bot.gridPosition;
    var bestScore = 0;
    var towardsBonus = false;

    for ( var i = 0; i < this.safeDirections.length; i++ ) {
      var direction = this.safeDirections[i];

      var x = bot.gridPosition.x + direction.dir.x;
      var y = bot.gridPosition.y + direction.dir.y;

      if ( this.rewardMap[x][y] > bestScore) {
        bestScore = this.rewardMap[x][y];
        bonusDestination = {x: x, y: y};
        towardsBonus = true;
      }

      if ( closestPlayer) {
        var distanceToPlayer = Math.abs( closestPlayer.x - x) + Math.abs( closestPlayer.y - y);
        if ( distance > distanceToPlayer) {
          if ( bot.previousGridPos.x != x || bot.previousGridPos.y != y) {
            distance = distanceToPlayer;
            playerDestination = {x: x, y: y};
            toPlayer = true;
          }
        }
      }
    }

    if ( this.safeDirections.length === 1) {
      bot.setDestination( {
        x: bot.gridPosition.x + this.safeDirections[0].dir.x,
        y: bot.gridPosition.y + this.safeDirections[0].dir.y
      });
    } else {
      if ( towardsBonus) {
        if ( bonusDestination.x === bot.previousGridPos.x &&
          bonusDestination.y === bot.previousGridPos.y &&
          toPlayer) {
          bot.setDestination( playerDestination);
        } else {
          bot.setDestination( bonusDestination);
        }
      } else {
        bot.setDestination( playerDestination);
      }
    }
  },

  getClosestPlayerPos: function ( bot) {
    var distance = 9999;
    var closestPlayerPos;

    for ( var i = 0; i < this.players.length; i++) {
      var playerPos = Utils.convertToGridPosition( this.players[i].position);

      var playerBotDistance = Math.abs( playerPos.x - bot.gridPosition.x) + Math.abs( playerPos.y - bot.gridPosition.y);

      if ( distance > playerBotDistance && !this.players[i].dead) {
        distance = playerBotDistance;
        closestPlayerPos = playerPos;
      }
    }

    return closestPlayerPos;
  },

  // ****************###################***********************

  /**
   * @author Gabriel Titerlea
   *
   * Update all objects on the screen and delete any element if necessary
   * */
  animateObjects: function () {

    var bombExploded = this.animateBombs();
    this.animateFires();

    if ( bombExploded) {
      this.calculateRewardMap();
    }

    // animate players
    for (var i = 0; i < this.players.length; i++) {
      this.players[i].update();
    }

    // animate bots
    for (var i = 0; i < this.bots.length; i++) {
      this.bots[i].update();
    }

    this.stage.update();
  },

  /**
   * @author Gabriel Titerlea
   *
   * Tick the bomb timer and explode the bombs when the timer reaches zero
   * */
  animateBombs: function () {
    this.possibleFires = [];
    var bombExploded = false;

    // tick bombs
    var bombs = this.bombs;
    var index = bombs.length;
    while (index--) {
      var bomb = bombs[index];

      var willExplode = bomb.tick();
      if (willExplode) {
        this.explodeBomb( bomb);
        bombExploded = true;
      }
    }

    // remove the exploded bombs
    index = bombs.length;
    while (index--) {
      var bomb = this.bombs[index];
      if (bomb.exploded) {
        this.stage.removeChild( bomb.bmp);
        this.bombs.splice(index, 1);
      }
    }

    return bombExploded;
  },

  explodeBomb: function ( bomb) {

    if (!bomb.exploded) {
      bomb.exploded = true;
      createjs.Sound.play('bombsound').setVolume(1);

      var dangerPositions = bomb.getDangerPositions( this.tiles);
      for (var i = 0 ; i < dangerPositions.length; i++) {
        var dangerPos = dangerPositions[i];
        this.possibleFires.push( dangerPos);

        for (var j = 0; j < this.bombs.length; j++) {
          var b = this.bombs[j];
          if (b.gridPosition.x === dangerPos.x && b.gridPosition.y === dangerPos.y && b !== bomb) {
            this.explodeBomb( b);
          }
        }
      }

      if (bomb.owner) {
        bomb.owner.recoverBomb();
        if (bomb.owner.escapeBomb === bomb) {
          bomb.owner.escapeBomb = null;
        }
      }

      this.stage.removeChild( bomb.shadow);
      this.stage.removeChild( bomb.bmp);

      this.tiles[bomb.gridPosition.x][bomb.gridPosition.y] = null;
    }
  },

  calculateRewardMap: function () {

    var i, j;
    var width = this.nrTilesWidth + 2;
    var height = this.nrTilesHeight + 2;

    for ( i = 0; i < width; i++) {
      for ( j = 0; j < height; j++) {
        if ( this.tiles[i][j]) { //&& ((this.tiles[i][j] instanceof Wall) || (this.tiles[i][j] instanceof Wood) || (this.tiles[i][j] instanceof Bomb))) {
          this.rewardMap[i][j] = -1;
        } else {
          this.rewardMap[i][j] = 0;
        }
      }
    }

    for ( i = 0; i < this.bonuses.length; i++) {
      var bonus = this.bonuses[i];
      if ( !this.tiles[bonus.gridPosition.x][bonus.gridPosition.y]) {
        this.spreadRewards( bonus);
      }
    }
  },

  spreadRewards: function ( bonus, remove) {

    var x = bonus.gridPosition.x;
    var y = bonus.gridPosition.y;

    var lowI = x - 3;
    // make sure we stay within the boundaries of the map
    lowI = (lowI < 1) ? (1) : (lowI);

    var highI = x + 3;
    // make sure we stay within the boundaries of the map
    highI = (highI >= this.nrTilesWidth) ? (this.nrTilesWidth) : (highI);

    var lowJ = y - 3;
    // make sure we stay within the boundaries of the map
    lowJ = (lowJ < 1) ? (1) : (lowJ);

    var highJ = y + 3;
    // make sure we stay within the boundaries of the map
    highJ = (highJ >= this.nrTilesHeight) ? (this.nrTilesHeight) : (highJ);

    for ( var i = lowI; i <= highI; i++) {
      for ( var j = lowJ; j <= highJ; j++) {
        if ( this.rewardMap[i][j] >= 0) {
          if ( remove) {
            this.rewardMap[i][j] -= 6 - (Math.abs( x - i) + Math.abs( y - j));
          } else {
            this.rewardMap[i][j] = 6 - (Math.abs( x - i) + Math.abs( y - j));
          }
        }
      }
    }
  },

  animateFires: function () {
    // create fresh fires
    for (var i = 0; i < this.possibleFires.length; i++) {
      var pos = this.possibleFires[i];

      // remove wood bmp
      if (this.tiles[pos.x][pos.y] instanceof Wood) {
        this.stage.removeChild(this.tiles[pos.x][pos.y].bmp);
        this.tiles[pos.x][pos.y] = null;
      }

      if (!this.tiles[pos.x][pos.y]) {
        var fire = new Fire( this.images['fire'], pos);

        this.stage.addChild(fire.bmp);
        this.fires.push(fire);
      }
    }

    // remove extinguished fires
    var index = this.fires.length;
    while(index--) {
      var fire = this.fires[index];
      if (fire.extinguished) {
        this.stage.removeChild(fire.bmp);
        this.fires.splice(index, 1);
      }
    }
  },

  endGame: function () {

    if (this.nrPlayers === 1 && this.players.length === 1 && this.bots.length === 0) {
      this.gameOver( 'Player 1 won!', this.player1.score, true);
    } else if (this.nrPlayers === 1 && this.player1.dead) {
      this.gameOver( 'Game Over!', this.player1.score);
      this.gameOver( 'Game Over!', this.player1.score);
    } else if (this.nrPlayers === 2) {
      if (this.player1.dead && !this.player2.dead && this.bots.length === 0) {
        this.gameOver( 'Player 2 won!', this.player2.score, true);
      } else if (this.player2.dead && !this.player1.dead && this.bots.length === 0){
        this.gameOver( 'Player 1 won!', this.player1.score, true);
      } else if (this.player1.dead && this.player2.dead) {
        this.gameOver( 'Game Over!', 0);
      }
    }
  },

  gameOver: function ( gameOverResult, score, showOff) {

    var gameOverText = [];
    gameOverText.push(gameOverResult);
    gameOverText.push('score: ' + score);

    // show the cursor
    this.canvas.style.cursor = 'default';

    var menu = new Menu( gameOverText, null, this.nrTilesWidth, this.nrTilesHeight, this.images, true);
    this.stage.addChild(menu.content);

    this.input.removeListeners( 'pause');
    menu.onNext( this.restart);

    var self = this;
    createjs.Ticker.removeAllEventListeners();

    if ( showOff) {
      this.showingOff = true;
      this.showOffTimes = 0;
      setTimeout( this.showOff.bind(this), 600);
    }
    createjs.Ticker.addEventListener( 'tick', function () {

      self.animateBombs();
      self.animateFires();

      self.stage.update();
    });

    this.showingOff = true;
  },

  showOff: function () {
    this.showOffTimes++;

    for ( var i = 0; i < 12; i++) {

      var x = Utils.getRandomInt( 1, this.nrTilesWidth);
      var y = Utils.getRandomInt( 1, this.nrTilesHeight);

      if ( !this.tiles[x][y]) {
        var timer = Utils.getRandomInt( 10, 80);
        var bomb = new Bomb( this.images['bomb'], this.images['shadow'], {x: x, y: y}, 1, 0, timer);

        this.tiles[x][y] = bomb;

        this.bombs.push( bomb);
        this.stage.addChildAt( bomb.bmp, 0);
        this.stage.addChildAt( bomb.shadow, 0);
      }
    }

    if (!this.paused && this.showOffTimes < 50) {
      setTimeout( this.showOff.bind(this), 300);
    }
  },

  /**
   * @author Gabriel Titerlea
   *
   * takes the game back to the main menu
   * */
  restart: function () {
    var self = Bombergirl;

    // show the cursor
    self.canvas.style.cursor = 'default';

    createjs.Sound.play('bonus').setVolume(0.6);

    // remove the listeners for pause because otherwise there would be two listeners for the
    // same thing and togglePause would be called twice on every key press
    self.input.removeListeners( 'pause');
    self.input.addListener( 'pause', self.togglePause);

    document.removeEventListener( 'touchstart', self.onTouchStart);
    document.removeEventListener( 'touchmove', self.onTouchMove);
    document.removeEventListener( 'touchend', self.onTouchEnd);

    createjs.Ticker.removeAllEventListeners();
    self.stage.removeAllChildren();
    self.cleanUp();

    self.fill();
  },

  scale: function () {
    var self = Bombergirl;

    var tileSize = self.computeTileSize();
    var ratio = self.spaceRatio;

    // Update the canvas size
    self.canvas.width = self.nrTilesWidth * tileSize;
    self.canvas.height = self.nrTilesHeight * tileSize;

    self.stage.scaleX = ratio;
    self.stage.scaleY = ratio;

    if (self.notificationsArea) {
      self.notificationsArea.style.height = tileSize + 'px';
      self.notificationsArea.style.width = (self.canvas.width - 5) + 'px';

      self.notificationsArea.style.fontSize = tileSize - 1 + 'px';
    }

    self.stage.update();
  },

  getContainerSizes : function () {
    var renderBox = document.getElementById("renderBox");
    var height = window.getComputedStyle( renderBox, null).getPropertyValue( "height");
    var width = window.getComputedStyle( renderBox, null).getPropertyValue( "width");
    return { width : parseInt( width), height : parseInt( height)};
  },

  computeTileSize : function () {
    var tileSize;

    var containerSizes = this.getContainerSizes();
    var pixelsPerCellWidth = containerSizes.width / this.nrTilesWidth;
    var pixelsPerCellHeight = containerSizes.height / (this.nrTilesHeight + 1);

    // compute the space ration based on available screen resolution
    tileSize = parseInt(Math.min( pixelsPerCellWidth, pixelsPerCellHeight));

    this.spaceRatio = tileSize / gSize;
    return tileSize;
  },

  handleClickQuitButtonEvent: function () {
    var self = Bombergirl;

    self.cleanUp();

    self.stage = null;
    self.spaceRatio = 1;

    self.soundtrackStarted = false;
    self.soundtrack.stop();
    self.soundtrack = null;
    self.mute = true;
    createjs.Sound.setMute(true);

    self.quited = true;
    self.manualPaused = false;

    document.removeEventListener( 'keydown', self.onKeyDown);
    document.removeEventListener( 'keyup', self.onKeyUp);

    document.removeEventListener( 'touchstart', self.onTouchStart);
    document.removeEventListener( 'touchmove', self.onTouchMove);
    document.removeEventListener( 'touchend', self.onTouchEnd);

    window.removeEventListener( 'resize', self.scale);
    window.removeEventListener( 'focus', self.unPause);
    window.removeEventListener( 'blur', self.pause);
  },

  cleanUp: function () {

    createjs.Ticker.removeAllEventListeners();

    this.paused = false;

    this.nrPlayers = null;
    this.players = [];
    this.player1 = null;
    this.player2 = null;

    this.bots = [];

    this.tiles = null;
    this.woodsPositions = [];
    this.bonuses = [];
    this.bombs = [];
    this.possibleFires = [];
    this.fires = [];

    try { // try because on the first call of the function notificationsArea is null
      this.notificationsArea.parentNode.removeChild(this.notificationsArea);
    } catch (e) {}

    this.oaNumbers = [];
    this.correctNumbers1 = [];
    this.correctNumbers2 = [];
  }
};