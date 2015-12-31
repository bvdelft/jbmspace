/**
* Socket connected to the proxy.

* proxy : address to proxy.
* gameStarted: function to be called when game is started.
**/
function NetworkSocket(clientName) {
	
	this.clientName = clientName;
  
  /**
   * Socket used for communication, see www.socket.io
   **/
  this.socket = SocketManager.createSocket(this);
  
	this.setClientName = function (clientName) {
			this.clientName = clientName;
			this.socket = SocketManager.createSocket(this);
		};

  /**
   * Used in the socket-functionality below.
   **/
  var self = this;
  
  
  //// Incoming 
  
  /**
   * Received a list of available games on the proxy. 
   * Adds a div with a list of buttons for each game.
   **/
  this.socket.on('games_list', function (data) {
    var all_games = data.all_games;
		if (self.listGamesCallback)
			self.listGamesCallback(all_games);
  });
  
  /**
   * The proxy confirms we joined the requested game. We create a new client
   * and call the callback function.
   **/
  this.socket.on('joined_game', function() {
    logger.log("NetworkSocket.on.joined_game", 'Joined game');
    self.player = new PlayerClient(self.name, self.socket);
		if (typeof self.gameStarted != "undefined")
			self.gameStarted();
  });
  
  /**
   * We created a game and become the host of that game. We cannot join any
   * other game, or host any other game, under this login.
   **/
  this.socket.on('game_created', function() {
    logger.log("NetworkSocket.on.game_created", 'Game created');
    self.host = new GameHost(self.socket);
    self.gameStarted();
  });
  
  /**
   * Host-messages forwarded to the client by the proxy. Only relevant when we
   * actually are a player, not a host. The message is forwarded to the player's
   * client.
   **/
  this.socket.on('forwardHC', function(data) {
  	logger.log("NetworkSocket.on.forwardHC", "SOCKET IN " + JSON.stringify(data.obj));
    if (self.player)
      self.player.onReceive(data.msg,data.obj);
    else
      logger.warn("Received unexpected client message.");
  });
  
  /**
   * Client-messages forwarded to the host by the proxy. Only relevant when we
   * actually are a host, not a player. The message is forwarded to the host's
   * client.
   **/
  this.socket.on('forwardCH', function(data) {
    if (self.host)
      self.host.onReceive(data.name, data.data.msg, data.data.data);
    else
      logger.warn("Received unexpected host message.");
  });
  
  // More specific forwarding for the host
  this.socket.on('player_joined', function(name) {
    self.host.playerJoined(name);
  });
  this.socket.on('player_left', function(name) {
    self.host.playerLeft(name);
  });
  
  // simple logging
  this.socket.on('login_failed', function() {
    logger.info("NetworkSocket.on.login_failed", 'Login failed');
  });
  this.socket.on('login_ok', function() {
    logger.info("NetworkSocket.on.login_ok", 'Logged in');
		if (self.loginCallback) {
			self.loginCallback();
		}
  });
  this.socket.on('not_logged_in', function() {
    logger.info("NetworkSocket.on.not_logged_in", 'Not logged in');
  });
  this.socket.on('no_such_game', function() {
    logger.info("NetworkSocket.on.no_such_game", 'The game does not exist');
  });  
  this.socket.on('killed', function(data) {
    logger.log("NetworkSocket.on.killed", 'Connection killed by logging in elsewhere. ');
  });
  this.socket.on('host_disconnected', function(data) {
    logger.log("NetworkSocket.on.host_disconnected",'Host disconnected');
  });  
  this.socket.on('illegal_host', function(data) {
    logger.log("NetworkSocket.on.illegal_host",'Illegal host');
  });
  this.socket.on('error', function(data) {
    logger.error("NetworkSocket.on.error", data);
  });



  
  //// Outgoing


  /**
   * Attempt to login with username and password on the proxy. Note the complete
   * absence of encryption...
   **/
  this.login = function(username, password, loginCallback) {
    this.name = username;
		this.loginCallback = loginCallback;
    this.socket.emit('login', { username : username
                              , password : password });
  };
  
  /**
   * Request to join a game, proxied by this proxy.
   **/
  this.joinGame = function(gameid, gameStarted) {
		this.gameStarted = gameStarted;
    this.socket.emit('join', gameid);
  };
	
	this.loginAndJoinGame = function(username, password, gameid) {
		var self = this;
		this.socket = SocketManager.updateSocketID(this.clientName, username);
		this.clientName = username;
		this.login(username, password, function() {
				self.joinGame(gameid);
			});
	};
  
  /**
   * Request to create a new game, for which this browser window will be host.
   **/
  this.createGame = function(name, gameStarted) {
		this.gameStarted = gameStarted;
    this.socket.emit('new_game', name);
  }
  
  /**
   * Request a list of existing games on this proxy.
   **/
  this.getExistingGames = function (cb) {
		this.listGamesCallback = cb;
    this.socket.emit('list_games');
  };

}

