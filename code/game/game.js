/**
 * Game.js
 *
 * Loops the renderer, game-controller etc.
 *
 * For single player, leave out the playerClient argument
 */
function Game(menu, playerClient) {

	this.menu = menu;

	/**
	 * The client network socket
	 **/
	this.playerClient = playerClient;
	
	/**
	 * Game UI
	 **/
	this.hud = new HUD(menu);

	this.collisionController = new CollisionController(this);
	
	/**
	 * For single player mode:
	 * 
	 * Creates one client, with special name 'singlePlayer'
	 **/
	if (typeof this.playerClient == "undefined") {
		logger.info("Game", "Game got no playerClient, going for single player.");
		this.playerClient = new PlayerClient("singlePlayer", "singlePlayer");
	}
	
	logger.log("Game", "Initialised game for client " + this.playerClient.name + ".");
	
	// So that the network may make calls to addEntity etc.
	this.playerClient.setGame(this);
	
	
	// Controllers:
	
	this.gameController = new GameController();
	this.renderer = new Renderer(menu);
	this.audioController = new AudioController();
	this.imageController = new ImageController();
	
	var self = this;

	this.keyboardListener = new KeyboardListener();
	this.keyboardListener.onKeyPress("F1", this.hud.renderInfo);
	this.keyboardListener.onKeyPress("F2", function () { self.menu.updateGameStateFB(self.renderer) });
	this.mouseListener = new MouseListener(this.renderer.renderer.domElement);
	logger.log("Game", "All game controllers and listeners initialised.");
	
	/**
	 * This variable stores the Player-entity for that is this client.
	 **/
	this.player;
	
	/**
	 * Called when the server informs the client which player he is.
	 * Sets this.player and adds all listeners for player interaction.
	 **/
	this.initPlayer = function (player) {
		this.player = player;
		var self = this;
		this.keyboardListener.onKeyChange('W', function(b) { player.up(b, self.audioController.walking); });
		this.keyboardListener.onKeyChange('S', function(b) { player.down(b, self.audioController.walking); });
		this.keyboardListener.onKeyChange('A', function(b) { player.left(b); });
		this.keyboardListener.onKeyChange('D', function(b) { player.right(b); });
		this.mouseListener.onMouseMove(function(x, y) {
			player.mouseMovementListener(self, x,y);
		});
		this.mouseListener.addMouseClick(function(x,y) {
			self.audioController.laser.get();
			self.fire();
		});
		
		logger.log("Game.initPlayer", "Client received own player; listeners added.");
	}

	// moet waarschijnlijk ergens anders heen...
	this.fire = function() {
		var bullet = new Bullet(this.player.loc.slice(), this.player.ori.slice(), 0.01, this.player.__id);
		this.requestEntity(bullet.__func, bullet.__args, bullet.getInitData());
	}
	
	
	/**
	 * Start the pre-loading of all images, audio and renderer.
	 **/
	this.load = function() {
		this.imageController.load();
		this.audioController.load();
		this.mouseListener.load();
		this.keyboardListener.load();
		this.gameController.load();
		this.renderer.setCameraPosition(0, 0, 5);
		var self = this;
		setInterval(function(){self.syncAllEntities()}, 1000 / 60);
	};
	
	/**
	 * Returns true when preloading is finished.
	 **/
	this.ready = function() {
		return this.audioController.ready()
			&& this.imageController.ready();
	}
	
	/**
	 * Start the game as a loops:
	 * - one running the renderer, at 60 FPS if possible
	 **/
	this.run = function() {

		var self = this;
		
		// Cycle renderer:

		window.requestAnimFrame = (function(){
		return  window.requestAnimationFrame		||
				window.webkitRequestAnimationFrame	||
				window.mozRequestAnimationFrame		||
				function( callback ){
					window.setTimeout(callback, 1000 / 10); //60 FPS
				};
			})();
			
		(function animloop(){
			requestAnimFrame(animloop);
			self.renderer.updateAllEntities();
			self.collisionController.detect();
			self.renderer.updateCamera(self.player);
			self.renderer.draw();
			
			self.updateFPS();
		})();
		
		this.playerClient.syncReady = true;
		
	};
	
	// For displaying the FPS:
	
	this.FPSCount = 0;
	this.lastFPSTime = Date.now();
	this.updateFPS = function() {
		this.FPSCount++;		
		var now = Date.now();
		var elapsed = now - this.lastFPSTime;
		if(elapsed > 1000) {
			this.lastFPSTime = now - (elapsed - 1000);			
			this.menu.hud.fps.html(this.FPSCount);
			this.FPSCount = 0;
		}
	}
	
	// Game changes
	
	/**
	 * Creates and adds an entity to the game.
	 * type : the type of the entity as defined in entity.js -- we assume that
	 *        an appropriate constructor function is available in INIT_ENTITY.
	 * id   : the id for this entity as dictated by the server.
	 * initData : data to set the initial values of the entity.
	 **/
	this.addEntity = function(constructor, args, initData, id) {
		logger.log("Game.addEntity", "Adding entity of type " + constructor + " with id " + id);
		var entity = eval(constructor).apply(null,args);
		entity.__id = id;
		for (var prop in initData) {
			entity[prop] = initData[prop];
		}
		this.renderer.initEntity(entity, eval(constructor));
		this.renderer.addEntity(entity);
		this.gameController.addEntity(entity);
		
		if (eval(constructor) === Player) {
			this.players[entity.__id] = entity;
			this.menu.updateScores(this.players)
		}
		
		if (eval(constructor) === Player && this.playerClient.name == entity.name) {			
			this.initPlayer(entity);
			entity.needsSyncing = true;
			this.run();
		}
	}
	
	
	
	this.players = { };
	
	this.requestEntity = function(constructor, args, initData) {
		if (this.playerClient.socket != 'singlePlayer') {
			logger.log("Game.requestEntity", "Requesting entity of type " + constructor);
			this.playerClient.reqAddEntity(constructor, args, initData);
		} else {
			this.addEntity(constructor, args, initData, freshID());
		}
	}
	
	this.incScore = function (id) {
		this.players[id].score++;
		this.menu.updateScores(this.players)
	}
	
	/**
	 * Remove the entity with the specified id.
	 **/
	this.removeEntity = function(id) {
		logger.log("Game.removeEntity", "Removing "  + id);
		this.renderer.removeEntity(this.gameController.allEntities[id]);
		this.gameController.removeEntity(id);
	};
	
	// Ergens anders heen?
	
	
	// Update all entities.
	this.syncAllEntities = function() {
			for (var key in this.gameController.allEntities) {
				var syncdata = this.gameController.allEntities[key].getSyncData();
				if (syncdata != null)
					this.playerClient.syncEntity(key,syncdata);
			}
		};

}
