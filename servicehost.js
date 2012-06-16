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
/*
var proxyServer = httpProxy.createServer(function(req, res, proxy){

	var chunks = "";
	var buf = [];
	req.on('data', function(chunk){
		chunks += chunk.toString();
		buf.push(chunk);
		//console.log(chunk.toString());
	});
	
	req.on('end', function(){
		console.log(chunks.toString());
		var buffer = httpProxy.buffer(req);
		var route = {
			host: 'localhost',
			port: 8000, 
			buffer: buffer
		};	
		proxy.proxyRequest(req, res, route);
	});
  });
  */
proxyServer.listen(9000);

app.init(function (err) {
	if(err){
		console.log(err);
		}
});


