var Menu = function ( text, nrPlayers, nrTilesWidth, nrTilesHeight, images, extraDark) {

  var shadowOffset = 3;

  this.content = new createjs.Container();

  var bgGfx = new createjs.Graphics()
    .beginFill( '#000000')
    .setStrokeStyle(1)
    .drawRect( gSize, gSize, (nrTilesWidth - 2) * gSize, (nrTilesHeight - 2) * gSize)
    .endFill();

  var bg = new createjs.Shape( bgGfx);
  bg.alpha = 0.1;

  if ( extraDark) {
    bg.alpha = 0.25;
  }

  this.content.addChild(bg);

  this.nrTilesWidth = nrTilesWidth;
  this.nrTilesHeight = nrTilesHeight;
  this.images = images;
  this.text = text;

  // The text of the menu
  var mainText = new createjs.Text( text[0], 'bold 55px Helvetica', '#ffffff');
  mainText.textBaseline = 'alphabetic';
  var mainBounds = mainText.getBounds();
  mainText.x = ( gSize * this.nrTilesWidth - mainBounds.width) / 2;
  mainText.y = gSize * 6.5;

  var mainTextShadow = new createjs.Text( text[0], 'bold 55px Helvetica', '#000000');
  mainTextShadow.textBaseline = 'alphabetic';
  mainTextShadow.x = mainText.x + shadowOffset;
  mainTextShadow.y = mainText.y + shadowOffset;
  mainTextShadow.alpha = 0.5;

  // if text has two elements than it means this is a game over menu
  if (text[1]) {
    var secoText = new createjs.Text( text[1], 'bold 30px Helvetica', '#ffffff');
    secoText.textBaseline = 'alphabetic';
    var secoBounds = secoText.getBounds();
    secoText.x = ( gSize * this.nrTilesWidth - secoBounds.width) / 2;
    secoText.y = gSize * 8;

    var secoTextShadow = new createjs.Text( text[1], 'bold 30px Helvetica', '#000000');
    secoTextShadow.textBaseline = 'alphabetic';
    secoTextShadow.x = secoText.x + shadowOffset;
    secoTextShadow.y = secoText.y + shadowOffset;
    secoTextShadow.alpha = 0.5;

    this.content.addChild( mainTextShadow);
    this.content.addChild( mainText);
    this.content.addChild( secoTextShadow);
    this.content.addChild( secoText);

    var nextText = new createjs.Text( 'Play again', 'bold 32px Helvetica', '#ffffff');
    var nextBounds = nextText.getBounds();
    nextText.x = (gSize * this.nrTilesWidth - nextBounds.width) / 2;
    nextText.y = gSize * (this.nrTilesHeight / 2 + 2.5);

    var nextTextShadow = new createjs.Text( 'Play again', 'bold 32px Helvetica', '#000000');
    nextTextShadow.x = nextText.x + shadowOffset;
    nextTextShadow.y = nextText.y + shadowOffset;
    nextTextShadow.alpha = 0.5;

    this.next = new createjs.Shape( new createjs.Graphics()
      .beginFill( '#000000')
      .drawRect( nextText.x - 5, nextText.y - 5, nextBounds.width + 10, nextBounds.height + 10)
      .endFill());
    this.next.alpha = 0.01;

    this.content.addChild( nextTextShadow);
    this.content.addChild( nextText);
    this.content.addChild( this.next);
  } else {
    this.createMenuImages();
    this.content.addChild( mainTextShadow);
    this.content.addChild( mainText);

    var textSingle = new createjs.Text( 'Singleplayer', 'bold 32px Verdana', '#ffffff');
    var textSingleBounds = textSingle.getBounds();
    textSingle.x = (gSize * this.nrTilesWidth - textSingleBounds.width) / 2;
    textSingle.y = gSize * (this.nrTilesHeight / 2 + 1.5);

    var textSingleShadow = new createjs.Text( 'Singleplayer', 'bold 32px Verdana', '#000000');
    textSingleShadow.x = textSingle.x + shadowOffset;
    textSingleShadow.y = textSingle.y + shadowOffset;
    textSingleShadow.alpha = 0.5;

    this.singlePlayerText = new createjs.Shape( new createjs.Graphics()
      .beginFill( '#000000')
      .drawRect( textSingle.x - 5, textSingle.y - 5, textSingleBounds.width + 10, textSingleBounds.height + 10)
      .endFill());
    this.singlePlayerText.alpha = 0.01;

    this.content.addChild( textSingleShadow);
    this.content.addChild( textSingle);
    this.content.addChild( this.singlePlayerText);

    if (nrPlayers > 1) {
      var textMulti = new createjs.Text( 'Multiplayer', 'bold 32px Verdana', '#FF4444');
      var textMultiBounds = textMulti.getBounds();
      textMulti.x = textSingle.x + 12;
      textMulti.y = gSize * (this.nrTilesHeight / 2 + 2.8);

      var textMultiShadow = new createjs.Text( 'Multiplayer', 'bold 32px Verdana', '#000000');
      textMultiShadow.x = textMulti.x + shadowOffset;
      textMultiShadow.y = textMulti.y + shadowOffset;
      textMultiShadow.alpha = 0.5;

      this.multiPlayerText = new createjs.Shape( new createjs.Graphics()
        .beginFill( '#000000')
        .drawRect( textMulti.x - 5, textMulti.y - 5, textMultiBounds.width + 10, textMultiBounds.height + 10)
        .endFill());
      this.multiPlayerText.alpha = 0.01;

      this.content.addChild( textMultiShadow);
      this.content.addChild( textMulti);
      this.content.addChild( this.multiPlayerText);
    }

    /*var copyrightText = new createjs.Text( 'Music by: RoccoW', 'bold 19px Helvetica', '#FFFFFF');
    copyrightText.x = gSize * nrTilesWidth - copyrightText.getBounds().width - 10;
    copyrightText.y = gSize * nrTilesHeight - copyrightText.getBounds().height - 10;

    var copyrightBox = new createjs.Shape( new createjs.Graphics()
      .beginFill( '#000000')
      .drawRect( copyrightText.x - 2, copyrightText.y - 2, copyrightText.getBounds().width + 4, copyrightText.getBounds().height + 4)
      .endFill());
    copyrightBox.alpha = 0.01;

    copyrightBox.addEventListener('click', function () {
      window.location.href = 'http://freemusicarchive.org/music/RoccoW/';
    });

    this.content.addChild(copyrightText);
    this.content.addChild(copyrightBox);*/
  }
};

Menu.prototype.onSinglePlayer = function ( handleSingle) {
  this.singlePlayerText.addEventListener( 'click', handleSingle);
};

Menu.prototype.onMultiPlayer = function ( handleMulti) {
  this.multiPlayerText.addEventListener( 'click', handleMulti);
};

Menu.prototype.onNext = function ( handleNext) {
  this.next.addEventListener( 'click', handleNext);
};

Menu.prototype.createMenuImages = function () {
  for (var j = 1; j <= this.nrTilesHeight; j++) {
    var wood = new Wood(this.images['wood'], {x: 1, y: j});
    this.content.addChild(wood.bmp);

    wood = new Wood(this.images['wood'], {x: this.nrTilesWidth, y: j});
    this.content.addChild(wood.bmp);
  }

  for (var i = 2; i <= this.nrTilesWidth - 1; i++) {
    var wood = new Wood(this.images['wood'], {x: i, y: 1});
    this.content.addChild(wood.bmp);

    wood = new Wood(this.images['wood'], {x: i, y: this.nrTilesHeight});
    this.content.addChild(wood.bmp);
  }

  for (i = 3; i < 6; i += 2) {
    for (var j = 3; j < 6; j += 2) {
      var wall = new Wall( {x: i, y: j}, this.images['wall']);
      this.content.addChild( wall.bmp);

      wall = new Wall( {x: this.nrTilesWidth - i + 1, y: j}, this.images['wall']);
      this.content.addChild( wall.bmp);

      wall = new Wall( {x: this.nrTilesWidth - i + 1, y: this.nrTilesHeight - j + 1}, this.images['wall']);
      this.content.addChild( wall.bmp);

      wall = new Wall( {x: i, y: this.nrTilesHeight - j + 1}, this.images['wall']);
      this.content.addChild( wall.bmp);
    }
  }

  var wall = new Wall( {x: 3, y: Math.floor(this.nrTilesHeight / 2) + 1}, this.images['wall']);
  this.content.addChild( wall.bmp);

  wall = new Wall( {x: this.nrTilesWidth - 2, y: Math.floor(this.nrTilesHeight / 2) + 1}, this.images['wall']);
  this.content.addChild( wall.bmp);

  var playerImage = new Player( this.images['betty'], this.images['shadow'], {x: this.nrTilesWidth / 2 - 1, y: 4}, null);
  playerImage.bmp.scaleX = 2;
  playerImage.bmp.scaleY = 2;
  playerImage.bmp.gotoAndPlay( 'down');
  this.content.addChild(playerImage.bmp);

  var bombImage = new Bomb( this.images['bomb'], this.images['shadow'], {x: this.nrTilesWidth / 2 + 1, y: 4}, 1, null);
  bombImage.bmp.scaleX = 2;
  bombImage.bmp.scaleY = 2;
  this.content.addChild(bombImage.bmp);
};