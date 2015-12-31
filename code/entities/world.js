/**
 * World.js
 */
function World() {

	this.loc = [0, 0, -.01];
	this.ori = [0, 0, 0];
	this.texture = "desert";
	
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

	this.destroy = function() {
		throw "You can not destroy the world you idiot!";
	}
}

World = Entity.__include(World);

