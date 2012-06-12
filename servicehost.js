var broadway = require('broadway');
var app = new broadway.App();

app.use(require('./services/databaseservice'));
app.init(function (err) {
	if(err){
		console.log(err);
		}
});