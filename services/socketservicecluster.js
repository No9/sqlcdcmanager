var cluster = require('cluster');
var http = require('http');
var numCPUs = require('os').cpus().length;
var sio = require('socket.io');
var winston = require('winston');

startserver(8090);


module.exports =  {
	start : startserver
}

function startserver(port){
	if (cluster.isMaster) {
	  // Fork workers.
	  for (var i = 0; i < numCPUs; i++) {
		cluster.fork();
	  }
		
		function messageHandler(msg) {
			if (msg.cmd && msg.cmd == 'cdcevent') {
			  numReqs += 1;
			}
		  }
  
		Object.keys(cluster.workers).forEach(function(id) {
			cluster.workers[id].on('message', messageHandler);
		});
  
	  cluster.on('exit', function(worker, code, signal) {
		console.log('worker ' + worker.process.pid + ' died');
	  });
	  var msg = 'http://localhost:' + port + '/'
	  winston.log('info', 'socket.io cluster started on '.yellow + msg.cyan);
	} else {
	  // Workers can share any TCP connection
	  // In this case its a HTTP server
	  var app = require('http').createServer(handler)
	  var RedisStore = sio.RedisStore;
	  var io = require('socket.io').listen(app)
		io.configure(function () {
			io.set('store', new RedisStore({ nodeId: function () { return process.pid } }));
		});
		app.listen(port);
	    io.sockets.on('connection', function (socket) {
		  socket.emit('nodeId', process.pid);

		  socket.on('cdcevent', function (data, fn) {
			socket.broadcast.emit('cdcevent', data);
		  });

		  socket.on('restart', function (data) {
			io.sockets.in('').emit('restart');
		  })
		});

	}
}



function handler (req, res) {
    res.writeHead(200);
    res.end('socket.io server is running Served from ' + process.pid);
}
