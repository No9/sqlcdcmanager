var broadway = require('broadway');
var httpProxy = require('http-proxy');
var winston = require('winston');
var app = new broadway.App();

app.use(require('./services/databaseservice'));
app.use(require('./apps/cdcmanager/app'));
app.use(require('./apps/broadcastmanager/app'));
var options = {
  router: {
    'localhost/services': '127.0.0.1:8000',
    'localhost/config': '127.0.0.1:8001'
  }
};

var proxyServer = httpProxy.createServer(options);
proxyServer.listen(9000);
winston.log('info',"Main Site Starting On http://localhost:9000/config/");

app.init(function (err) {
	if(err){
		winston.log('error', err);
	}
});


