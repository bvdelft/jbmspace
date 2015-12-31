/**
 * GameController.js
 */
function GameController() {
	
	// Game state:
	this.allEntities = { };
	
	this.addEntity = function(entity) {
		this.allEntities[entity.__id] = entity;
	};
	
	this.removeEntity = function(id) {
		logger.log("GameController.removeEntity", "Removing "  + id);	
		delete this.allEntities[id];
	};
	
	this.syncEntity = function(id, data, ts, isServer) {
		logger.log("GameController.syncEntity", "Syncing " + id);
		logger.log("GameController.syncEntity", JSON.stringify(data));
		this.allEntities[id].integrate(data);
		if (!isServer) {
			//this.allEntities[id].update(this.gametime-ts);
		}
	}
	
	this.prev_t = (new Date()).getTime();
	this.gametime = 0;
	
	this.update = function() {	
		var n_t = (new Date()).getTime();
		var t_elapsed = n_t - this.prev_t;
		this.gametime += t_elapsed;
		for (var i in this.allEntities) {
			if (this.allEntities[i].destroyMe)
				this.removeEntity(this.allEntities[i].__id);
			else
				this.allEntities[i].update(t_elapsed);
		}
		this.prev_t = n_t;
	}

	this.load = function() {
		var self = this;
		setInterval(function(){self.update()}, 1000 / 60);
	};
}
