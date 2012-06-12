var broadway = require('broadway');
var httpProxy = require('http-proxy');

var app = new broadway.App();

app.use(require('./services/databaseservice'));
app.use(require('./apps/cdcmanager/app'));

var options = {
  router: {
    'localhost/services': '127.0.0.1:8000',
    'localhost/config': '127.0.0.1:8001'
  }
};

var proxyServer = httpProxy.createServer(options);
proxyServer.listen(9000);

app.init(function (err) {
	if(err){
		console.log(err);
		}
});


