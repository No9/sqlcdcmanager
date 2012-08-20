var app = require('http').createServer(handler)
  , io = require('socket.io').listen(app)

module.exports =  {
	start : startserver
}

function handler (req, res) {
    res.writeHead(200);
    res.end('socket.io server is running');
  }

function startserver(port){
	app.listen(port);
	return io;
}