var SocketManager = (function () {
	
	this.connect = function (proxy) {
			this.socket = io.connect(proxy);
		};
	
	this.listeners = {};
	
	this.createSocket = function (networkSocket) {
			if (!this.socket) {
				logger.error("SocketManager.createSocket", "SocketManager not yet connected!");
				return;
			}
			var id = networkSocket.clientName;
			this.listeners[id] =
				{ networkSocket : networkSocket
				, handles : new Object
				, on : function (str, f) { SocketManager.addHandle(id, str, f); }
				, emit : function (msg, data) { SocketManager.emit(id, msg, data); }
				};
			this.socket.on(id, function (data) { SocketManager.on(id, data.instruction, data.msg); });
			return this.listeners[id];
		};
		
	this.addHandle = function (id, str, f) {
			this.listeners[id].handles[str] = f;
		};
	
	this.emit = function (id, msg, data) {
			this.socket.emit(msg, {data:data, client:id});
		};
	
	this.on = function (id, msg, data) {
			if (typeof this.listeners[id] == "undefined")
				logger.log("SocketManager.on", "No listeners for client " + id);
			else if (typeof this.listeners[id].handles[msg] == "undefined")
				logger.log("SocketManager.on", "No listener for client " + id + " for message " + msg);
			this.listeners[id].handles[msg](data);
		};
	
	this.updateSocketID = function (id, newID) {
			logger.log("SocketManager.updateSocketID", id+ " to " + newID);
			var old = this.listeners[id];
			this.listeners[newID] =
				{ networkSocket : old.networkSocket
				, handles : old.handles
				, on : function (str, f) { SocketManager.addHandle(newID, str, f); }
				, emit : function (msg, data) { SocketManager.emit(newID, msg, data); }
				};
			this.socket.on(newID, function (data) { SocketManager.on(newID, data.instruction, data.msg); });
			delete this.listeners[id];
			return this.listeners[newID];			
		};
	
	return this;
})();