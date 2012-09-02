var httpServer = require('http-server');
var winston = require('winston');

exports.init = function(done)
{
    var config = {};
	config.port = 8001;
	var port = config.port,
			host = config.domain || '0.0.0.0',
			log = winston.log;
		
		
		var options = {
		  root: "./apps/cdcmanager/root",
		  autoIndex: true,
		  cache: true
		}
		function onListening() {
		  log('info', 'http-server Started serving '.yellow
			+ server.root.cyan
			+ ' on port: '.yellow
			+ port.toString().cyan);
		  log('info', 'Hit CTRL-C to stop the server'.red);
		}

		var server = httpServer.createServer(options);
		server.listen(port, host, onListening);
	return done();
};