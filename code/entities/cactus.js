/**
 * Cactus.js
 */
function Cactus() {

	this.loc = [1.0, 1.0, -.01];
	this.ori = [0, 0, 0];
	this.texture = "cactus";

	this.velocity = 0;

	this.getSyncData = function() {
		return null;
	}

	this.integrate = function(data) {
		this.loc = data.loc;
		this.ori = data.ori;
		this.velocity = data.velocity;
	}

	this.update = function(t_elapsed) { };
}

Cactus = Entity.__include(Cactus);

