var httpServer = require('http-server');

exports.init = function(done)
{
    var config = {};
	config.port = 8001;
	var port = config.port,
			host = config.domain || '0.0.0.0',
			log = console.log;
		
		
		var options = {
		  root: "./apps/cdcmanager/root",
		  autoIndex: true,
		  cache: true
		}
		function onListening() {
		  log('Starting up http-server, serving '.yellow
			+ server.root.cyan
			+ ' on port: '.yellow
			+ port.toString().cyan);
		  log('Hit CTRL-C to stop the server');
		}

		var server = httpServer.createServer(options);
		server.listen(port, host, onListening);
	return done();
};