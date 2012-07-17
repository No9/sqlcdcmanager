var request = require('request');
var sql = require('node-sqlserver');
var hookio = require('hook.io'); 
var winston = require('winston');
var ldnmanager = require('./ldnmanager.js');
var trackedtables = [];

var hookB = hookio.createHook({
  name: "sqlcdc"
});

exports.init = function(done){
	setInterval(checkdatabasesforschemachange, 5000);
	setInterval(checktablesfordatachanges, 1000);
	return done();
};

function checkdatabasesforschemachange(){
	request('http://localhost:8000/services/databases', function (error, response, body) {
	  if (!error && response.statusCode == 200) {
		var databases = JSON.parse(body);
		for(var i=0; i < databases.length; i++){
			if(databases[i].cdcenabled == "1"){
				winston.log('info', databases[i].name + ' is enabled');
				requesttables(databases[i].name);
			}
		}
	  }
	})
}

function requesttables(databasename){
	request('http://localhost:8000/services/databases/' + databasename, function (error, response, body) {
	
	var tables = JSON.parse(body);
		for(var j = 0; j < tables.length; j++){
			if(tables[j].is_tracked_by_cdc == "1"){
				// Create a tracked object
				var trackedObject = {};
				trackedObject.database = databasename;
				trackedObject.name = tables[j].name + "_" + tables[j].tablename + "_CT";
				winston.log('info', 'Looking for config changes on ' + databasename + ':' + tables[j].tablename);
				
				//We have have to see if the tracked object is in our current list of tracked objects
				//if it isn't then add it
				if(!contains(trackedtables, trackedObject)){
					var sqlcdc_conn_str = "Driver={SQL Server Native Client 11.0};Server=(local);Database=sqlcdc;Trusted_Connection={Yes}";
					var cdcdata = "SELECT * FROM tablestatus where tablename = '" + trackedObject.name + "' AND databasename = '" + databasename + "';";
					winston.log('debug', cdcdata);
					
					(function(trkObj){
						var stmt = sql.query(sqlcdc_conn_str, cdcdata);
						stmt.on('meta', function (meta) { });
						stmt.on('column', function (idx, data, more) { 
							if(idx == 2)
								trkObj.ldn = ldnmanager.parseldn(data);
						});
						stmt.on('done', function () {
							if(trkObj.ldn == undefined){
								trkObj.ldn = 0;
							}
							trackedtables.push(trkObj);
							winston.log('info', 'Added ' + trkObj.name + ' to the tracked tables list with ldn ' + trkObj.ldn);
						});
						stmt.on('error', function (err) { console.log("requesttables had an error :-( " + err); });
					})(trackedObject);
				}
			}
		}
	})
}

function checktablesfordatachanges(){
	for(var i=0;i < trackedtables.length;i++){
		var dbname = trackedtables[i].database;
		var tblname = trackedtables[i].name
		var ldn = trackedtables[i].ldn;
		var conn_str = "Driver={SQL Server Native Client 11.0};Server=(local);Database=" + dbname + ";Trusted_Connection={Yes}";
		var databasecdc = "SELECT * FROM cdc." + tblname + " where __$start_lsn > " + ldn;
		var datagram = [];
		var metadata = [];
		var currentObject = {};
		var stmt = sql.query(conn_str, databasecdc);
		
		stmt.on('meta', function (meta) { metadata = meta;});
		
		stmt.on('row', function (idx) { 
				currentObject = {};
		});
		
		stmt.on('column', function (idx, data, more) { 
			if(idx == 0){
				ldn = ldnmanager.parseldn(data);
			}
			currentObject[metadata[idx].name] = data;
			if(!more)
			{
				datagram.push(currentObject);
			}
		});
			
		stmt.on('done', function () { 
			ldnmanager.setldn(trackedtables, dbname, tblname, ldn);
			ldnmanager.saveldn(dbname, tblname, ldn, function(){
				hookB.emit('data', datagram);
			});
		});
		
		stmt.on('error', function (err) { console.log("checktablesfordatachanges had an error :-( " + err); });
	}
}

function contains(a, obj) {
    var i = a.length;
    while (i--) {
       if ((a[i].database == obj.database) &&  (a[i].tablename == obj.tablename)){
           return true;
       }
    }
    return false;
}