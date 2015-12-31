/**
 * Castle.js
 */
function Castle(loc, color, ownerId) {

	this.size = 3;
	this.loc = loc;
	this.ori = [0, 0, 0];
	this.texture = "castle_" + color;
	this.radius = 1.5;
	this.ownerId = ownerId;

}

Castle = Entity.__include(Castle);