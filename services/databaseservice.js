var sql = require('node-sqlserver');
var http = require('http');
var director = require('director');

exports.init = function(done)
{

	function databaselist(route)
	{
		this.res.writeHead(200, { 'Content-Type': 'application/json' })
		var conn_str = "Driver={SQL Server Native Client 11.0};Server=(local);Database=master;Trusted_Connection={Yes}";
		var databasecdc = "SELECT [name], database_id, is_cdc_enabled  FROM sys.databases"; 
		var _res = this.res;
		
		sql.open(conn_str, function (err, conn) {
			if (err) {
				console.log("Error opening the connection!");
				return;
			}
			conn.queryRaw(databasecdc, function (err, results) {
				if (err) {
					console.log("Error running query!");
					return;
				}
				var items = [];
				for (var i = 0; i < results.rows.length; i++) {
					var item = {};
					item.name = results.rows[i][0];
					item.id = results.rows[i][1];
					item.cdcenabled = results.rows[i][2];
					items.push(item);
				}
				_res.end(JSON.stringify(items));
			});
		});
	}

	var router = new director.http.Router({
		'/databases' : { get : databaselist }
	});

	var server = http.createServer(function(req, res){
		router.dispatch(req, res, function(err) {
			if(err) {
				res.writeHead(404);
				res.end();
			}
		});

	});

	server.listen(8000);
	return done();
};