if (typeof process.argv[2] == "undefined") {
	console.log('Usage: node space.js [portnumber]');
	return;
}

var space = require('http').createServer(httpReqHandler)
var io = require('socket.io').listen(space, { log: false })
var fs = require('fs')

io.set('origins', '*:*');

space.listen(process.argv[2]);

function httpReqHandler (req, res) {
	res.writeHead(200);
	return res.end("yeah");
}