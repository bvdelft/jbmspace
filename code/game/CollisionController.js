/**
 * Detects collissions and calls the appropriate collisionevent when one is detected.
 *
 * This class presumes that all entities have the following fields and methods:
 *  - loc (vector)]
 *  - radius
 *  - id
 *  - moving()
 */

function CollisionController(game) {

	this.game = game;

	this.detect = function() {
		var movedEntities = this.getMovedEntities();
		var collidableEnts = this.getCollidableEntities();
		var handledEntities = [];
		for (var movedId in movedEntities) {
			var moved = movedEntities[movedId];
			for(var entId in collidableEnts) {
				var ent = collidableEnts[entId];
				if(ent.__id != moved.__id) {// && $.inArray(ent, handledEntities) < 0) { //if not found (-1)
					if (this.didCollide(moved, ent)) {
						this.createCollisionEvent(moved, ent);
					}
				}
			}
			moved.moved = false; //no longer relevant now, reset for next run.
			handledEntities.push(moved);
		}
	}

	this.getMovedEntities = function() {
		var movedEntities = [];
		for(var entId in this.game.gameController.allEntities) {
			if(this.game.gameController.allEntities[entId].moving()) {
				movedEntities.push(this.game.gameController.allEntities[entId]);
			}
		}
		return movedEntities;
	}

	this.getCollidableEntities = function() {
		var collidable = [];
		for(var entId in this.game.gameController.allEntities) {
			var ent = this.game.gameController.allEntities[entId];
			if(ent.__func != "World") {
				collidable.push(ent);
			}
		}
		return collidable;
	}

	this.didCollide = function(moved, ent) {
		//for now only circles.
		var xd = Math.abs(moved.loc[0] - ent.loc[0]);
		var yd = Math.abs(moved.loc[1] - ent.loc[1]);

		var r = Math.sqrt(xd*xd + yd*yd);
		return r < moved.radius + ent.radius;
	}

	this.createCollisionEvent = function(moved, ent) {
		//moved.unUpdate();
		//moved.loc = [0,0,0];
		console.log("Collision!");
		var col = moved.__func < ent.__func ? moved.__func + ent.__func : ent.__func + moved.__func;
		var ent1 = moved.__func < ent.__func ? moved : ent;
		var ent2 = moved.__func > ent.__func ? moved : ent;
		switch(col) {
			case "PlayerPlayer": PlayerPlayerCollision(ent1, ent2); break;
			case "BulletPlayer": BulletPlayerCollision(this.game, ent1, ent2); break;
			case "BulletBullet": BulletBulletCollision(ent1, ent2); break;
			case "CactusPlayer": CactusPlayerCollision(ent1, ent2); break;
			case "BulletCactus": BulletCactusCollision(ent1, ent2); break;
			case "CastlePlayer": CastlePlayerCollision(ent1, ent2); break;
			case "BulletCastle": BulletCastleCollision(ent1, ent2); break;
			default:
				logger.error("Unknown collision");
				break;
		}
	}
}