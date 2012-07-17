var request = require('request');
var sql = require('node-sqlserver');
var hookio = require('hook.io'); 

var trackedtables = [];

exports.init = function(done)
{
	setInterval(checkdatabasesforschemachange, 5000);
	setInterval(checktablesfordatachanges, 1000);
	return done();
};


function checkdatabasesforschemachange(){
	console.log("Checking Database Configuration Change");

	request('http://localhost:8000/services/databases', function (error, response, body) {
	  if (!error && response.statusCode == 200) {
		var databases = JSON.parse(body);
		for(var i=0; i < databases.length; i++){
			if(databases[i].cdcenabled == "1")
			{
				requesttables(databases[i].name);
			}
		}
	  }
	  console.log(trackedtables);
	})
}

function contains(a, obj) {
    var i = a.length;
    while (i--) {
       if ((a[i].database == obj.database) &&  (a[i].tablename == obj.tablename)){
           return true;
       }
    }
	//Put removal in here.
    return false;
}

function requesttables(databasename){
	request('http://localhost:8000/services/databases/' + databasename, function (error, response, body) {
				    console.log(databasename);
					var tables = JSON.parse(body);
					for(var j = 0; j < tables.length; j++){
							if(tables[j].is_tracked_by_cdc == "1"){
								var trackedObject = {};
								trackedObject.database = databasename;
								trackedObject.name = tables[j].name + "_" + tables[j].tablename + "_CT";
								 
								if(!contains(trackedtables, trackedObject)){
									var sqlcdc_conn_str = "Driver={SQL Server Native Client 11.0};Server=(local);Database=sqlcdc;Trusted_Connection={Yes}";
									var cdcdata = "SELECT * FROM tablestatus where tablename = '" + trackedObject.name + "' AND databasename = '" + databasename + "';";
									var stmt = sql.query(sqlcdc_conn_str, cdcdata);
									
									stmt.on('meta', function (meta) { });
									stmt.on('row', function (idx) { console.log("We've started receiving a row"); });
									
									stmt.on('column', function (idx, data, more) { 
										if(idx == 2)
											trackedObject.ldn = parseldn(data);
									});
									stmt.on('done', function () { 
										if(trackedObject.ldn == undefined){
											console.log("TRACKED OBJECT IS UNDEFINED");
										
											trackedObject.ldn = 0;
										}
										trackedtables.push(trackedObject);
										console.log(trackedObject); 
									});
									stmt.on('error', function (err) { console.log("requesttables had an error :-( " + err); });
									
											
								}
							}
					}
				})
}

var hookB = hookio.createHook({
  name: "sqlcdc"
});

function setldn(dbname, tblname, ldn)
{	
	console.log(trackedtables.length);
	
	var i = trackedtables.length;
    while (i--) {
       if ((trackedtables[i].database == dbname) &&  (trackedtables[i].name == tblname)){
			trackedtables[i].ldn = ldn;
			return true;
       }
    }
	//Put removal in here.
    return false;
}

function parseldn(data)
{
	var tmpldn = "";
	for (ii = 0; ii < data.length; ii++) {
		var o = data.readUInt8(ii).toString(16);
		while(o.length < 2) o = "0" + o;
		tmpldn += o;
	}
	return "0x" + tmpldn;
}

function checktablesfordatachanges(){
	for(var i=0;i < trackedtables.length;i++){
		var dbname = trackedtables[i].database;
		var tblname = trackedtables[i].name
		var ldn = trackedtables[i].ldn;
		console.log("Tracked Database : " + dbname);
		
		var conn_str = "Driver={SQL Server Native Client 11.0};Server=(local);Database=" + dbname + ";Trusted_Connection={Yes}";
		var databasecdc = "SELECT * FROM cdc." + tblname + " where __$start_lsn > " + ldn;
		
		var datagram = [];
		var metadata = [];
		var currentObject = {};
		var stmt = sql.query(conn_str, databasecdc);
		
		stmt.on('meta', function (meta) { metadata = meta;});
		
		stmt.on('row', function (idx) { 
				currentObject = {};
				console.log("We've started receiving a row"); 
		});
		
		stmt.on('column', function (idx, data, more) { 
				if(idx == 0){
					ldn = parseldn(data);
				}
				currentObject[metadata[idx].name] = data;
				if(!more)
				{
					datagram.push(currentObject);
				}
			});
		stmt.on('done', function () { 
		    setldn(dbname, tblname, ldn);
			hookB.emit('data', datagram);
			
			var sqlcdc_conn_str = "Driver={SQL Server Native Client 11.0};Server=(local);Database=sqlcdc;Trusted_Connection={Yes}";
			var sqlcdc_databasecdc = "MERGE INTO [sqlcdc].[dbo].[tablestatus]";
				sqlcdc_databasecdc += "USING (SELECT '" + dbname + "' AS dbname, '" + tblname + "' as tblname ) AS SRC ";
				sqlcdc_databasecdc += "ON tablestatus.databasename = SRC.dbname AND tablestatus.tablename = SRC.tblname ";
				sqlcdc_databasecdc += "WHEN MATCHED THEN UPDATE SET ";
				sqlcdc_databasecdc += "currentLSN = " + ldn + " ";
				sqlcdc_databasecdc += "WHEN NOT MATCHED THEN ";
				sqlcdc_databasecdc += "INSERT (databasename, tablename, currentLSN) ";
				sqlcdc_databasecdc += "VALUES (SRC.dbname, SRC.tblname, " + ldn + ");";
			var sqlcdc_stmt = sql.query(sqlcdc_conn_str, sqlcdc_databasecdc);
			sqlcdc_stmt.on('error', function (err) { console.log("merge had an error. Have your created the sqlcdc database? " + err); });
	
		});
		stmt.on('error', function (err) { console.log("checktablesfordatachanges had an error :-( " + err); });
	}
}

