/** Usage. **/

if (typeof process.argv[2] == "undefined") {
	console.log('Usage: node space.js [portnumber]');
	return;
}

var space = require('http').createServer(httpReqHandler)
	, io = require('socket.io').listen(space, { log: false })
	, fs = require('fs')
space.listen(process.argv[2]);

/** Utilities. **/

var USERS = { bart : 'vendis'
						, mart : 'blabox'
						, jeroen : 'snake'
						, sara : 'anything'
						, host : 'ghost'	};

function checkLogin(username, password) {
	return USERS[username] == password;
}

function signalError(socket, message) {
	if (typeof socket != "undefined")
		socket.emit('error',message);
}

/** Specialised socket (allows multiple 'connections' per client).
		Through most of the code when something is called socket it is actually
		a MySocket. **/
function MySocket (socket, identifier) {
	this.socket = socket;
	this.identifier = identifier;
	this.player = new Player(identifier, this );
	this.emit = function (instruction, msg) {
			this.socket.emit(identifier, { instruction:instruction, msg:msg });
		};
}

/** Player and manager. **/

var PlayerManager = (function () {
		this.players = {};
		this.addPlayer = function (player) {
				if (this.players[player.name]) {
					signalError(player.socket, "Player already exists.");
					return;
				}
				this.players[player.name] = player;
			};
		return this;
	});

function Player (name, socket) {

	this.name = name;
	this.socket = socket;
	
	this.joinGame = function(game) {
		if (this.hosting) {
			signalError(this.socket, "Player already hosting game " + this.hosting.name);
			return;
		}
		this.game = game;
	}

	this.hostGame = function(game) {
		if (this.game) {
			signalError(this.socket, "Player already playing game " + this.game.name);
			return;
		}
		this.hosting = game;
	}

}
/** Game and manager. **/

var GameManager = (function () {		
		this.games = {};
		this.addGame = function (game) {
				if (this.games[game.name]) {
					signalError(game.socket, "Game already exists.");
					return;
				}
				this.games[game.name] = game;
			};
		this.joinGame = function(player, gamename) {
				if (typeof this.games[gamename] != "undefined") {
          this.games[gamename].addPlayer(player);
          player.socket.emit('joined_game');
        } else {
          player.socket.emit('no_such_game');
        }
			};
		this.closeAll = function () {
				for (var g in this.games) {
					this.games[g].hostDisconnected();
				}
			};
		return this;
	})();

function Game(name, host) {

	this.name = name;
	this.host = host;
	this.lastActivity = Date.now();
	
	this.players = { };

	this.addPlayer = function(player) {
		if (this.players[player.name]) {
			signalError(player.socket, "Player with name '" + player.name + "' already in this game.");
			return;
		}
		console.log("Player '" + player.name + "' joins game '" + this.name + "'.");
		this.players[player.name] = player;
		player.joinGame(this);
		this.host.socket.emit('player_joined', player.name);
		this.lastActivity = Date.now();
	}

	this.removePlayer = function(player) {
		if (this.players[player.name]) {
			delete this.players[player.name];
			if (typeof this.player != "undefined")
				this.player.socket.emit('removed', player.name);
			if (typeof this.host != "undefined")
				this.host.socket.emit('player_left', player.name);
		}
	}

	this.sendAll = function (msg, data) {
		for (var s in this.players) {
			this.players[s].socket.emit(msg, data);
		}
		this.lastActivity = Date.now();
	}

	this.hostDisconnected = function() {
		for (var s in this.players) {
			this.players[s].socket.emit('host_disconnected', this.host.name);
			delete this.players[s].game;
		}
		delete GameManager.games[this.name];
	}
}

/** For regular requests, show minimal web page. **/

function httpReqHandler (req, res) {
	res.writeHead(200);
	var url = require('url') ;
	var query = url.parse(req.url,true).query;
	// Kill all games.
	if (query.killall == 1) {
		GameManager.closeAll();
	}
	var now = Date.now();
	var status = '<h1>This server hosts JBM Space!</h1>';
	status += '<p>Currently hosting ' + Object.keys(GameManager.games).length + ' games:</p>';
	status += '<ul>';
	for (var g in GameManager.games) {
		var game = GameManager.games[g];
		status += '<li>' + game.name + ' by "' +game.host.name+'" with players ';
		for (var p in game.players)
			status += p + ' ';
		status += '- Inactive for ' + (now-game.lastActivity) + 'ms';
	}
	status += '</ul>';
	return res.end(status);
}

/** Clean up inactive games. **/

setInterval(function	() {
		var now = Date.now();
		for (var g in GameManager.games) {
			var game = GameManager.games[g];
			if (now - game.lastActivity >= 60000)
				game.hostDisconnected();
		}
	},30000);

/** API **/

io.sockets.on('connection', function (socket) {

	var address = socket.handshake.address;
	address = address.address + ":" + address.port;
	console.log("New connection from " + address);

	socket.on('login', function (data) {
		var credentials = data.data;
		var mySocket = new MySocket(socket, credentials.username);
		if (checkLogin(credentials.username,
									 credentials.password)) {
			socket.get('mySockets', function (err, mysockets) {
					console.log("Logging in '" + credentials.username + "' from " + address);
					if (mysockets) {
						if (typeof mysockets[credentials.username] != "undefined") {
							mySocket.emit('already_loggedin');
						} else {
							mysockets[credentials.username] = mySocket;
							socket.set('mySockets', mysockets,
								function () { mySocket.emit('login_ok'); });
						}
					} else {
						var res = {};
						res[credentials.username] = mySocket;
						socket.set('mySockets', res,
							function () { mySocket.emit('login_ok'); });
					}
				});
		} else {
			mySocket.emit('login_failed');
		}
	});

	socket.on('join', function (data) {
		console.log("Player '" + data.client + "' wants to join from " + address);
		socket.get('mySockets', function (err, mysockets) {
			if (typeof mysockets != "undefined" && typeof mysockets[data.client] != "undefined" ) {
				GameManager.joinGame(mysockets[data.client].player, data.data);
			} else {
				var mySocket = new MySocket(socket, data.client);
				mySocket.emit('not_logged_in');
			}
		});
	});
	
	socket.on('new_game', function(data) {
		 socket.get('mySockets', function (err, mysockets) {
			if (typeof mysockets != "undefined " && typeof mysockets[data.client] != "undefined") {
				var player = mysockets[data.client].player
				console.log("Creating new game: " + data.data + " for player " + player.name);
				var game = new Game(data.data, player);
				GameManager.addGame(game);
				player.hostGame(game);
				player.socket.emit('game_created');
			} else {
				var mySocket = new MySocket(socket, data.client);
				mySocket.emit('not_logged_in');
			}
		});
	});

	socket.on('list_games', function (data) {
		console.log('Handling request to list games');
		var res = Array();
		for (var gameid in GameManager.games) {
			res.push ( { id	 : gameid, 
									 name : GameManager.games[gameid].name } );
		}
		var mySocket = new MySocket(socket, data.client);
		mySocket.emit('games_list', { all_games : res } );
	});

	// forward host -> client
	socket.on('forwardHC', function(data) {
		socket.get('mySockets', function (err, mysockets) {
			if (typeof mysockets != "undefined " && typeof mysockets[data.client] != "undefined") {
				var player = mysockets[data.client].player;
				var game = player.hosting;
				//console.log("Request forwarding HC " + player.name + " to " + game);
				if (typeof game != "undefined") {
					if (game.host.name == player.name) {
						//console.log("Sending all: " + data.data);
						game.sendAll('forwardHC', data.data);
					} else {
						player.socket.emit('illegal_host');
					}
				} else {
					player.socket.emit('not_in_game');
				}
			} else {
				var mySocket = new MySocket(socket, data.client);
				mySocket.emit('not_logged_in');
			}
		});
	});
	
	// forward host -> single client
	socket.on('forwardHSingleC', function(data) {
		socket.get('mySockets', function (err, mysockets) {
			if (typeof mysockets != "undefined " && typeof mysockets[data.client] != "undefined") {
				var player = mysockets[data.client].player;
				var game = player.hosting;
				//console.log("Request forwarding HSingleC " + player.name + " to " + game);
				if (typeof game != "undefined") {
					if (game.host.name == player.name) {
						if (game.players[data.data.player]) {
							game.players[data.data.player].socket.emit('forwardHC',data.data.data);
						} else {
							player.socket.emit('no_such_player');
						}
					} else {
						player.socket.emit('illegal_host');
					}
				} else {
					player.socket.emit('not_in_game');
				}
			} else {
				var mySocket = new MySocket(socket, data.client);
				mySocket.emit('not_logged_in');
			}
		});
	});
	
	
	// forward host -> other clients except one
	socket.on('forwardHExceptC', function(data) {
		socket.get('mySockets', function (err, mysockets) {
			if (typeof mysockets != "undefined " && typeof mysockets[data.client] != "undefined") {
				var player = mysockets[data.client].player;
				var game = player.hosting;
				//console.log("Request forwarding HExceptC " + player.name + " to " + game);
				if (typeof game != "undefined") {
					if (game.host.name == player.name) {
						for (var p in game.players) {
							if (p != data.data.player)
								game.players[p].socket.emit('forwardHC',data.data.data);
						}
					} else {
						player.socket.emit('illegal_host');
					}
				} else {
					player.socket.emit('not_in_game');
				}
			} else {
				var mySocket = new MySocket(socket, data.client);
				mySocket.emit('not_logged_in');
			}
		});
	});

	// forward client -> host
	socket.on('forwardCH', function(data) {
		socket.get('mySockets', function (err, mysockets) {
			if (typeof mysockets != "undefined " && typeof mysockets[data.client] != "undefined") {
				var player = mysockets[data.client].player;
				var game = player.game;
				//console.log("Request forwarding CH " + player.name + " to " + player.game);
				if (typeof game != "undefined") {
					game.host.socket.emit('forwardCH',
							{ name : player.name
							, data : data.data } );
				} else {
					player.socket.emit('not_in_game');
				}
			} else {
				var mySocket = new MySocket(socket, data.client);
				mySocket.emit('not_logged_in');
			}
		});
	});

	socket.on('disconnect', function() {
		console.log('Disconnected socket ' + socket.id);
		socket.get('mySockets', function (err, mysockets) {
			if (typeof mysockets != "undefined") {
				for (var key in mysockets) {
					var player = mysockets[key].player;
					console.log("Disconnected " + player.name);
					if (player.name == "host") {
						player.hosting.hostDisconnected();
					}
					if (typeof player.game != "undefined") {
						console.log("Disconnected player was in game hosted by " + player.game.host.name);
						player.game.removePlayer(player);
					}
				}
			} else {
				console.log('Was not logged in');
			}
		});
	});


});