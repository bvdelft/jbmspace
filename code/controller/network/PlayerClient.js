/**
 * Network communication; client side.
 **/
function PlayerClient(name, socket) {

	/**
	 * Username of this client; used to identify when certain messages or
	 * entities (such as player) are specific for this client.
	 **/
	this.name = name;
	
	/**
	 * The socket used in communication with the proxy.
	 **/
	this.socket = socket;
	
	// No syncing until own player is loaded
	this.syncReady = false;
	
	logger.log("PlayerClient", 'Created new playerClient for ' + name);

	/**
	 * Called by NetworkSocket.
	 * msg : the message sent by the host.
	 * data : the data associated with the message.
	 **/
	this.onReceive = function(msg,data) {
	
		logger.log("Game.onReceive", "Receiving: " + msg + (this.game ? "" : " (ignored)")); 
		// In case we are receiving message before setGame() is called..
        if (!this.game) return;
		switch (msg) {
			case "add_entity":
				this.game.addEntity(data.constructor, data.args, data.initData, data.id);
				break;
			case "add_entities":
				for (var i in data)
					this.game.addEntity(data[i].constructor, data[i].args, data[i].initData, data[i].id);
				break;
			case "remove_entity":
				this.game.removeEntity(data);
				break;
			case "sync_entity":
				if (this.syncReady)
					this.game.gameController.syncEntity(data.id, data.syncData, data.ts, false);
				break;
			case "server_time":
				this.game.gameController.gametime = data;
			default:
				logger.log("PlayerClient.onReceive", "PlayerClient " + this.name + " received unknown message: " + msg);
		}
	}
	
	/**
	 * Requests the socket to send the message and accompanying data to the host
	 * (via the proxy).
	 **/
	this.sendToHost = function(msg, data) {
		if (this.socket != 'singlePlayer')
		  this.socket.emit('forwardCH', {msg:msg,data:data});
	}
	
	/**
	 * Inform the host of the current status of this entity.
	 **/
	this.syncEntity = function(id, data) {
		this.sendToHost('sync_entity', 
			{ id : id
			, syncData : data
			, ts : this.game.gameController.gametime
			});
	}
	
	this.reqAddEntity = function(constructor, args, initData) {
		this.sendToHost('req_add_entity', 
			{ constructor : constructor
			, args : args
			, initData : initData
			, ts : this.game.gameController.gametime
			});
	}
	
	/**
	 * Inform the host that we are done pre-loading images, sounds, etc.
	 **/
	this.readyToReceive = function(reqColor) {
		this.sendToHost('ready_to_receive', reqColor);
	}
	
	/**
	 * Set the game that is associated with this client.
	 **/
	this.setGame = function(game) {
		this.game = game;
	}

}
