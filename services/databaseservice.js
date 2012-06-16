var sql = require('node-sqlserver');
var http = require('http');
var director = require('director');
var url = require('url');

exports.init = function(done)
{
	
	function databaselist(route)
	{
		
		
		var conn_str = "Driver={SQL Server Native Client 11.0};Server=(local);Database=master;Trusted_Connection={Yes}";
		var databasecdc = "SELECT [name], database_id, is_cdc_enabled  FROM sys.databases"; 
		var _res = this.res;
		
		sql.open(conn_str, function (err, conn) {
			if (err) {
				_res.writeHead(500, { 'Content-Type': 'application/json' })
				_res.end("Error opening the connection!");
				return;
			}
			conn.queryRaw(databasecdc, function (err, results) {
				if (err) {
					_res.writeHead(500, { 'Content-Type': 'application/json' })
					_res.end("Error running query!");
					return;
				}
				_res.writeHead(200, { 'Content-Type': 'application/json' })
				_res.write("[");
				for (var i = 0; i < results.rows.length; i++) {
					var item = {};
					item.name = results.rows[i][0];
					item.id = results.rows[i][1];
					item.cdcenabled = results.rows[i][2];
					item.location = '/config/database.html?name=' + results.rows[i][0]; 
					_res.write(JSON.stringify(item));
					if(i != results.rows.length - 1)
					{
						_res.write(",");
					}
				}
				_res.end("]");
			});
		});
	}
	
	function database(route){
	    var parts = url.parse(this.req.url);
		console.log(parts);
		var pathbits = parts.path.split("/"); 
		var dbname = pathbits.pop();
		var conn_str = "Driver={SQL Server Native Client 11.0};Server=(local);Database=" + dbname + ";Trusted_Connection={Yes}";
		var databasecdc = "SELECT sys.schemas.name, sys.tables.name AS tablename, sys.tables.create_date, sys.tables.modify_date, sys.tables.is_tracked_by_cdc, sys.tables.type_desc "
						  + "FROM sys.schemas INNER JOIN "
                          + "sys.tables ON sys.schemas.schema_id = sys.tables.schema_id"; 
		var _res = this.res;
		
		sql.open(conn_str, function (err, conn) {
			if (err) {
				_res.writeHead(500, { 'Content-Type': 'application/json' })
				_res.end("Error opening the connection!");
				return;
			}
			conn.queryRaw(databasecdc, function (err, results) {
				if (err) {
					_res.writeHead(500, { 'Content-Type': 'application/json' })
					_res.end("Error running query!");
					return;
				}
				_res.writeHead(200, { 'Content-Type': 'application/json' })
				_res.write("[");
				for (var i = 0; i < results.rows.length; i++) {
					var item = {};
					item.name = results.rows[i][0];
					item.tablename = results.rows[i][1];
					item.create_date = results.rows[i][2];
					item.modify_date = results.rows[i][3];
					item.is_tracked_by_cdc = results.rows[i][4];
					item.type_desc = results.rows[i][5];
					_res.write(JSON.stringify(item));
					if(i != results.rows.length - 1)
					{
						_res.write(",");
					}
				}
				_res.end("]");
			});
		});
	}
	
	function updatetable(route)
	{
	    var dbname = ''
		var conn_str = "Driver={SQL Server Native Client 11.0};Server=(local);Database=" + dbname + ";Trusted_Connection={Yes}";
		var databasecdc = "EXEC sys.sp_cdc_enable_table "; 
						  
	/*
	EXEC sys.sp_cdc_enable_table 
@source_schema = N'HumanResources', 
@source_name   = N'Shift', 
@role_name     = NULL 
	*/
		console.log(this.req);
	}
	
	var router = new director.http.Router({
		'/services/databases' : { get : databaselist },
		'/services/databases/*' : { get : database },
		'/services/database/table' : { post : updatetable }
	});

	var server = http.createServer(function(req, res){
		req.url = req.url.replace("//", "/services/");
		router.dispatch(req, res, function(err) {
			if(err) {
				res.writeHead(404);
				res.end(JSON.stringify(err) + '\n' + JSON.stringify(router));
			}
		});

	});

	server.listen(8000);
	return done();
};