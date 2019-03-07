window.addEventListener('load', init);

var successPattern = '123456789101112131415';

function init() {
	new Game();
}

function Game() {
	this.$container = document.getElementById('game');

	this.start();
}

Game.prototype = {
	start: function() {
		this.createTiles();
		this.registerEvents();
	},

	checkResult: function() {
		return this.tiles.map(function(tile) {
			return tile.content;
		}).join('') === successPattern;
	},

	trySwap: function(e) {
		var neighbours = [
			e.detail.index - 4,
			e.detail.index + 4,
			e.detail.index % 4 == 0 ? -1 : e.detail.index - 1,
			e.detail.index % 4 == 3 ? -1 : e.detail.index + 1 
		];

		for (var i = 0; i < neighbours.length; i++) {
			if (neighbours[i] < 0 || neighbours[i] > this.tiles.length - 1) {
				continue;
			}

			if (this.tiles[neighbours[i]].isClear) {
				this.swapTiles(e.detail.index, neighbours[i]);
				break;
			}
		}
	},

	swapTiles: function(currentIndex, indexToSwap) {
		var currentTile = this.tiles[currentIndex];
		var tileToSwap = this.tiles[indexToSwap];
		var neighbour = this.tiles[currentIndex + 1];
		var delta = indexToSwap - currentIndex;

		switch(delta) {
			case 1:
				this.$container.insertBefore(tileToSwap.$el, currentTile.$el);
				break;
			case -1:
				this.$container.insertBefore(currentTile.$el, tileToSwap.$el);
				break;
			case 4:
			case -4:
				this.$container.replaceChild(currentTile.$el, tileToSwap.$el);

				neighbour 
					? this.$container.insertBefore(tileToSwap.$el, neighbour.$el)
					: this.$container.appendChild(tileToSwap.$el);
					
				break;
		}
	
		currentTile.index = indexToSwap;
		tileToSwap.index = currentIndex;

		this.tiles[currentIndex] = tileToSwap;
		this.tiles[indexToSwap] = currentTile;

		if (this.checkResult()) {
			window.alert('Congrats!');
		}
	},

	registerEvents: function() {
		this.$container.addEventListener('tile.click', this.trySwap.bind(this));
	},

	createTiles: function() {
		var shuffled = this.shuffle();

		this.tiles = [];

		for (var i = 0; i < shuffled.length; i++) {
			var tile = new Tile(i, shuffled[i]);

			this.tiles.push(tile);

			this.$container.appendChild(tile.$el);
		}
	},

	shuffle: function() {
		var tiles = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,''];
		var shuffled = [];

		while (tiles.length) {
			var randomIndex = Math.round(Math.random() * (tiles.length - 1));
			var tile = tiles.splice(randomIndex, 1)[0];

			shuffled.push(tile);
		}

		return shuffled;
	}
};

function Tile(index, content) {
	var $tile = document.createElement('div');

	$tile.classList.add('tile');
	$tile.innerHTML = content;

	if (!content) {
		$tile.classList.add('clear');
	}

	this.$el = $tile;
	this.index = index;
	this.content = content;
	this.isClear = content === '';

	this.registerEvents();
}

Tile.prototype = {
	onClick: function(e) {
		this.$el.dispatchEvent(new CustomEvent('tile.click', {
			bubbles: true,
			detail: {index: this.index}
		}));

		e.stopPropagation();
	},

	registerEvents: function() {
		this.$el.addEventListener('click', this.onClick.bind(this));
	}
};