Bomb = Entity.extend({
    /**
     * Entity position on map grid
     */
    position: {},

    /**
     * How far the fire reaches when bomb explodes
     */
    strength: 1,

    /**
     * Bitmap dimensions
     */
    size: {
        w: 28,
        h: 28
    },

    /**
     * Bitmap animation
     */
    bmp: null,

    /**
     * Timer in frames
     */
    timer: 0,

    /**
     * Max timer value in seconds
     */
    timerMax: 1,

    exploded: false,

    fires: [],

    explodeListener: null,

    init: function(position, strength) {
        this.strength = strength;

        var spriteSheet = new createjs.SpriteSheet({
            images: [gGameEngine.bombImg],
            frames: { width: this.size.w, height: this.size.h, regX: 5, regY: 5 },
            animations: {
                idle: [0, 4, null, 10],
            }
        });
        this.bmp = new createjs.BitmapAnimation(spriteSheet);
        this.bmp.gotoAndPlay('idle');

        this.position = position;

        var pixels = gGameEngine.convertToBitmapPosition(position.x, position.y);
        this.bmp.x = pixels.x + this.size.w / 4;
        this.bmp.y = pixels.y + this.size.h / 4;

        this.fires = [];

        // Allow players and bots that are already on this position to escape
        var players = gGameEngine.getPlayersAndBots();
        for (var i = 0; i < players.length; i++) {
            var player = players[i];
            if (Utils.comparePositions(player.position, this.position)) {
                player.escapeBomb = this;
            }
        }
    },

    update: function() {
        if (this.exploded) { return; }

        this.timer++;
        if (this.timer > this.timerMax * gGameEngine.fps) {
            this.explode();
        }
    },

    explode: function() {
        this.exploded = true;

        if (!gGameEngine.mute) {
            createjs.Sound.play("bomb");
        }

        // Fire in all directions!
        this.fire(this.position);
        for (var i = 0; i < 4; i++) {
            var dirX;
            var dirY;
            if (i == 0) { dirX = 1; dirY = 0; }
            else if (i == 1) { dirX = -1; dirY = 0; }
            else if (i == 2) { dirX = 0; dirY = 1; }
            else if (i == 3) { dirX = 0; dirY = -1; }

            for (var j = 1; j <= this.strength; j++) {
                var explode = true;
                var last = false;

                var position = { x: this.position.x + j * dirX, y: this.position.y + j * dirY };
                var material = gGameEngine.getTileMaterial(position);
                if (material == 'wall') { // One can not simply burn the wall
                    explode = false;
                    last = true;
                } else if (material == 'wood') {
                    explode = true;
                    last = true;
                }

                if (explode) {
                    this.fire(position);
                }
                if (last) {
                    break;
                }
            }
        }

        // Cache tiles
        var tiles = [];
        for (var i = 0; i < gGameEngine.tiles.length; i++) {
            var tile = gGameEngine.tiles[i];
            tiles.push(tile);
        }

        // Burn all wood around!
        for (var i = 0; i < tiles.length; i++) {
            var tile = tiles[i];
            if (tile.material == 'wood'
                && ((tile.position.x == this.position.x - 1 && tile.position.y == this.position.y)
                    || (tile.position.x == this.position.x + 1 && tile.position.y == this.position.y)
                    || (tile.position.x == this.position.x && tile.position.y == this.position.y - 1)
                    || (tile.position.x == this.position.x && tile.position.y == this.position.y + 1) )) {
                tile.remove();
            }
        }

        this.remove();
    },

    fire: function(position) {
        var fire = new Fire(position, this);
        this.fires.push(fire);
    },

    remove: function() {
        gGameEngine.stage.removeChild(this.bmp);
    },

    setExplodeListener: function(listener) {
        this.explodeListener = listener;
    }
});