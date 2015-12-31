/**
 * Network communication; host side.
 **/
function GameHost(socket) {

	/**
	 * The socket to connect to the proxy with.
	 **/
	this.socket = socket;
	
	/**
	 * Host meta-state on players. 
	 * Note: independent from state of client in same window.
	 * Mapping from player username to actual in-game player entity.
	 **/
	this.allPlayers = { };
	
	/**
	 * Used for storing per-player (username) latency measuring.
	 **/
	this.lagData = { };
	
	/**
	 * Called by NetworkSocket.
	 * p : the player sending the message.
	 * msg : the message.
	 * data : the data associated with the message.
	 **/
	this.onReceive = function(p, msg, data) {
	
		// In the unlikely case we get a message before we know what our
		// controller is.
		if (!this.gameController) return;
	
		// Ignore messages for unlisted players.
		// Potentially we are still waiting for the player to inform us he
		// finished loading resources.
		if (!this.allPlayers[p] && msg != "ready_to_receive") {
			logger.info("GameHost.onReceive", "Unknown player " + p);
			return;
		}
		
		switch (msg) {
		case "sync_entity":
			// For now, just assume correctness of client info.
			//this.gameController.syncEntity(data.id, data.syncData, data.ts, true);
			this.notifyAllExcept(p, 'sync_entity', 
				{ ts : this.gameController.gametime
				, id : data.id
				, syncData : data.syncData });
			break;
		case "ready_to_receive":
			this.playerFirstContact(p, data);
			break;
		case "req_add_entity":
			var entity = eval(data.constructor).apply(null,data.args);
			entity.__id = freshID();
			for (var prop in data.initData) {
				entity[prop] = data.initData[prop];
			}
			this.gameController.addEntity(entity);
			this.notifyAll('add_entity', 
		  { constructor : entity.__func
		  , id : entity.__id
			, args : entity.__args
		  , initData : entity.getInitData() 
		  });
			break;
		default:
			logger.log("GameHost.onReceive", "Unknown message " + msg + " from player " + p);
		}
	};
	
	/**
	 * Set the game-state controller of the host's simulation.
	 **/
	this.setGameController = function(setGameController) {
		this.gameController = setGameController;
	}
	
	/**
	 * Player contacted host. Here we could already inform the player on e.g.
	 * where to find the files for the current level etc.
	 **/
	this.playerJoined = function(pName) {
	  logger.log("GameHost.playerJoined", "Player " + pName + " joined, " + 
	             "waiting for player to load content");
	} 

	/**
	 * Player finished loading content. We first inform this player about all
	 * the other players, then add a new player and inform everyone about that.
	 **/
	// Only four castle locations for now...
	this.castleCounter = 0;
	this.castles = [ [-4,-4,0], [4,4,0], [-4,4,0], [4,-4,0] ];
	this.playerFirstContact = function(pName, color) {
		this.notifyPlayer(pName, 'server_time', this.gameController.gametime)
		var res = new Array();
		for (var e in this.gameController.allEntities) {
		  var ent = this.gameController.allEntities[e];
		  res.push( { constructor : ent.__func
				    , args : ent.__args
						, id : ent.__id
				    , initData : ent.getInitData() 
				    });
		}
		this.notifyPlayer(pName, 'add_entities', res);
		logger.log("GameHost.playerFirstContact", "Creating player with color " + color);
		
		var player = new Player(pName, color, this.castles[this.castleCounter]);
		player.__id = freshID();
		this.allPlayers[pName] = player;
		this.lagData[pName] = [0,0];
		
		// add castle
		var castle = new Castle(this.castles[this.castleCounter], color, player.__id);
		castle.__id = freshID();
		
		this.notifyAll('add_entity', 
		  { constructor : castle.__func
		  , id : castle.__id
			, args : castle.__args
		  , initData : castle.getInitData() 
		  });
		this.notifyAll('add_entity', 
		  { constructor : player.__func
		  , id : player.__id
			, args : player.__args
		  , initData : player.getInitData() 
		  });
		
		this.gameController.addEntity(player);
		this.gameController.addEntity(castle);
		this.castleCounter  += 1;
		
		
		
		logger.log("GameHost.playerFirstContact", "Player " + pName + " finished loading and starts the game.");
	}

	/**
	 * Inform everyone that this player left, then remove this player.
	 **/
	this.playerLeft = function(pName) {
		var id = this.allPlayers[pName].id;
		this.notifyAll('remove_entity', id);
		this.gameController.removeEntity(id);
		delete this.lagData[pName];
		delete this.allPlayers[pName];
	}

	/**
	 * Forward message to all players.
	 **/
	this.notifyAll = function(msg, obj) {
		this.socket.emit('forwardHC', {msg:msg,obj:obj});
	}
	
	/**
	 * Forward message to a particular player.
	 **/
	this.notifyPlayer = function(player, msg, obj) {
		this.socket.emit('forwardHSingleC', {player:player, data:{msg:msg,obj:obj}});
	}
	
	/**
	 * Forward message to all but a particular player (probably the original
	 * sender of this message).
	 **/
	this.notifyAllExcept = function(player, msg, obj) {
		this.socket.emit('forwardHExceptC', {player:player, data:{msg:msg,obj:obj}});
	}
	
}
