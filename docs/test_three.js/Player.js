/**
 * Player.js
 */
function Player(name) {
	this.name = name;
	this.shoot = function() { /* shoot */ };
	this.move = function(x, y) { /* move to location */ };
}

/**
 * Game.js
 */
var p0 = new Player("Pietje");
p0.move(3, 5);
p0.shoot();