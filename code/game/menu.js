/**
 * Contains: Startmenu, loadingmenu and settingsmenu.
 */
function Menu(container) {

	this.container = container;
	this.menuBG;   // Background.
	this.menu;     // Space menu.
	this.gameList; // Listing of games.
	this.options;  // Options menu.
	this.loading;  // Loading overlay.
	this.hud;			 // Overlay information (.fps, .nObjects).
	this.canvas;   // The canvas where the game is rendered.

	/** Need to be able to connect in order to load list of games. **/
	SocketManager.connect(userSettings.server);
	
	/** Sockets for various usages **/
	this.noCredSocket = new NetworkSocket('tmptmp'); // Get list of games.	
	this.playerSocket; // Playing a game. Created when we know user name.
	this.hostSocket = new NetworkSocket('host'); // Hosting a game.
	
	/** Initialise all HTML elements. **/
	this.initDOM = function () {
			this.menu        = $("<div>", {class: "space-menu"});
			this.options     = $("<div>", {class: "menu-options"});
			this.gameList    = $("<div>", {class: "space-menu-games"});
			this.loading     = $("<div>", {class: "loading-menu"});
			this.hud         = $("<div>", {class: "hud"});
			this.renderInfo  = $("<div>", {class: "renderInfo"});
			this.canvas      = $("<canvas>", {class: "space-canvas"});
			
			var self = this;
			
			
			this.menu.append("<div class='menu-settings-button'></div>");
			this.menu.find(".menu-settings-button").click(function () { self.showOptions() });
			this.menu.append(this.gameList);
			this.menu.append(this.createMenuButton("New Game", 
				function () { self.newGame (); },'specialmenu'));
			this.menu.append(this.createMenuButton("Single Player", 
				function () { self.singlePlayer (); }, 'specialmenu'));
			
			this.options.append('<p><label for="options-server">Server:</label>' +
					'<input type="text" class="options-server" name="options-server" value="' + userSettings.server + '"/></p>');
			this.options.append('<p><label for="options-name">Name:</label>' +
					'<input type="text" class="options-name" name="options-name" value="' + userSettings.name + '"/></p>');
			this.options.append('<p><label for="options-password">Password:</label>' +
					'<input type="password" class="options-password" name="options-password" value="' + userSettings.pwd+ '"/></p>');
			var uglyString = '<p><label for="options-char">Character:</label><select name="options-char" class="options-char">';
			for(var key in this.playerOptions) {
				uglyString += '<option value="' + key + '">' + this.playerOptions[key] + "</options>";
			}
			uglyString += '</select></p>';			
			this.options.append(uglyString);
			var OK = this.createMenuButton("OK", function () { self.saveOptions() } );
			this.options.append(OK);
			
			this.loading.append("<h1 class='jbmspace-header'>JBM Space</h1>");
			this.loading.append("<h2 class='loading-header'>Loading...</h2>");
					
			this.renderInfo.append("<p>Info:</p>");
			this.renderInfo.append("<p>FPS: <span class='FPS-span'></span></p>");
			this.renderInfo.append("<p>nObjects: <span class='nobjects'></span></p>");
			
			this.gameStateFB = $("<table>");
			this.hud.fps      = this.renderInfo.find(".FPS-span");
			this.hud.nObjects = this.renderInfo.find(".nobjects");
			var wrapDiv = $("<div class='tableview'></div>");
			wrapDiv.append(this.gameStateFB);
			this.hud.append(wrapDiv);
			
			this.scoreTable = $("<table>");
			wrapDiv = $("<div class='score'></div>");
			wrapDiv.append(this.scoreTable);
			this.container.append(wrapDiv);
			
			this.menuBG = $("<div>", {class: "space-menu-wrap"});
			this.menuBG.append("<h1 class='jbmspace-header'>JBM Space</h1>");
			this.menuBG.append(this.menu);
			this.menuBG.append(this.options);
			this.menuBG.append("<div class=\"menu-footer\">JBM Software Netherlands/Sweden</div>");
			this.container.append(this.menuBG);
			this.container.append(this.loading);
			this.container.append(this.hud);
			this.hud.append(this.renderInfo);
			this.container.append(this.canvas);
			
			this.options.hide();
			this.loading.hide();
		};


	this.playerOptions = {black: "Black Storm", white: "White Storm", yellow: "Yellow Storm", red: "Red Storm", blue: "Blue Storm",
	green: "Green Storm", turqoise: "Turqoise Storm", purple: "Purple Storm", pink: "Pink Storm", princess: "Princess"};

	this.setGames = function(games) {
			var self = this;
			this.gameList.empty();
			for (var i = 0; i < games.length; i++) {
				var id = games[i].id;
				var f = function () {
						logger.log("Menu.joinGame", "Joining game " + id);
						self.playerSocket = new NetworkSocket(userSettings.name); 
						self.playerSocket.login(userSettings.name, userSettings.pwd,
							function () { self.playerSocket.joinGame(id,
									function () { self.gameJoined() }
								); } );
					};
				this.gameList.append(this.createMenuButton("<" + games[i].name + ">", f));
			}
		};
	
	this.gameJoined = function () {
			this.showLoadingMenu();
			logger.log("Menu.gameJoined", "Connected, starting game");
			var game = new Game(this, this.playerSocket.player);
			game.load();
			var self = this;
			var gameLoader = window.setInterval(function() {
				logger.log("Menu.gameJoined.gameLoader", "Still loading");
				if(game.ready()) {
					window.clearInterval(gameLoader);
					logger.log("Menu.gameJoined.gameLoader", "Everything loaded...");					
					EntityFactory.setImageController(game.imageController);
					self.playerSocket.player.readyToReceive(userSettings.character);
					self.showCanvas();
				}
			}, 1000);
		};
	
	this.newGame = function () {
			var self = this;
			this.hostSocket.login('host','ghost', function() {
					var name = prompt("Name of the game?");
					self.hostSocket.createGame(name, function () {
						logger.log("Menu.newGame", "Connected, created game.");
						var gamectrl = new GameController();
						gamectrl.isServer = true;
						self.hostSocket.host.setGameController(gamectrl);
						gamectrl.load();
						var w = new World();
						w.__id = freshID();
						gamectrl.addEntity(w);
						var c = new Cactus();
						c.__id = freshID();
						gamectrl.addEntity(c);
						self.playerSocket = new NetworkSocket(userSettings.name); 
						self.playerSocket.login(userSettings.name, userSettings.pwd,
							function () { self.playerSocket.joinGame(name,
									function () { self.gameJoined() }
								); } );
					});
				});
		};
	
	this.singlePlayer = function () {
			this.showLoadingMenu();
			var game = new Game(this);
			logger.log("Menu.singlePlayer", "Loading...");
			game.load();
			var gameLoader = window.setInterval(function(){
				logger.log("Menu.singlePlayer.gameLoader", "Still loading");
				if(game.ready()) {
					window.clearInterval(gameLoader);
					logger.log("Menu.singlePlayer.gameReady", "Everything loaded...");
					EntityFactory.setImageController(game.imageController);
					var p = new Player("singlePlayer", userSettings.character, [0,0,0]);
					game.addEntity(p.__func, p.__args, p.getInitData(), freshID());
					var w = new World();
					game.addEntity(w.__func, w.__args, w.getInitData(), freshID());
					var c = new Cactus();
					game.addEntity(c.__func, c.__args, c.getInitData(), freshID());
					var castle = new Castle([4,4,0], "red", 100);
					game.addEntity(castle.__func, castle.__args, castle.getInitData(), freshID());
					self.showCanvas();
				}
			}, 1000);
		};

	/** Helper functions. **/
	
	this.createMenuButton = function(name, callback, extraclass) {
			var button = document.createElement('input');
			button.className = 'menu-button';
			if (extraclass)
				button.className += ' ' + extraclass;
			button.value = name ;
			button.type = "button";
			button.onclick = callback;
			return button;
	}

	this.showLoadingMenu = function() {
		this.menuBG.hide();
		this.loading.show();
	}

	this.showCanvas = function() {
		this.loading.hide();
		this.canvas.show();
		this.scoreTable.parent().show();
	}
	
	this.showOptions = function() {
		this.options.show();
		this.menu.hide();
	};
	
	this.showMenu = function() {
		this.options.hide();
		this.menu.show();
	};
	

	this.saveOptions = function() {
		var name = this.options.find('.options-name')[0].value;
		var character = this.options.find('.options-char')[0].value;
		var server = this.options.find('.options-server')[0].value;
		var pwd = this.options.find('.options-password')[0].value;
		userSettings.setCookie(name, pwd, server, character);
		var self = this;

		this.noCredSocket.getExistingGames(function(games) {
			self.showMenu();
			self.setGames(games);
		});
	}

	this.hasCookieSettings = function() {
		return userSettings.name; // TODO: has to be boolean.
	}
	
	this.addTableMessage = function (obj, els) {
		var res = "<tr>";
		for (var i in els)
			res += "<td>" + els[i] + "</td>";
		res += "</tr>"
		obj.append(res);
	}
	
	this.updateGameStateFB = function ( renderer ) {
		this.gameStateFB.html("");
		this.addTableMessage(this.gameStateFB, ["id","texture","loc"]);
		for (var key in renderer.entities) {
			var el = renderer.entities[key];
			this.addTableMessage(this.gameStateFB, [key, el.texture, el.loc]);
		}
	}
	
	this.updateScores = function ( players ) {
		this.scoreTable.html("");
		// this.addTableMessage(this.scoreTable, ["name","score"]);
		for (var p in players) {
			var el = players[p];
			this.addTableMessage(this.scoreTable, [el.name, el.score]);
		}
	}
	
	/** If cookies are set, show menu and existing games. Otherwise jump straight
	    to options **/
	this.initDOM();
	if(this.hasCookieSettings()) {
		var self = this;
		this.noCredSocket.getExistingGames(function(games) {	self.setGames(games); });
	}	else {
		this.showOptions();
	}
	
}