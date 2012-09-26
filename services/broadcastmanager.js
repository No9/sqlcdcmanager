var request = require('request');
var sql = require('node-sqlserver');
var hookio = require('hook.io'); 
var winston = require('winston');
var ldnmanager = require('./ldnmanager.js');
var announce = require('socket.io-announce').createClient();

var config = require('../config.json');

var intervallist = {};

var hookB = hookio.createHook({
  name: "broadcastmanager"
});

hookB.on('*::databaseadded', function(data){
		winston.log('info', this.event + ' ' + data);
		console.log(data);
		intervallist[data.name] = setInterval(requesttables, 1000, data);
	});

	hookB.on('*::databaseremoved', function(data){
		winston.log('info', 'Removed ' + this.event + ' ' + data);
		clearInterval(intervallist[data]);
	});
	
exports.init = function(done){
	hookB.start();
	checkdatabasesforschemachange();
	return done();
};



function checkdatabasesforschemachange(){
	request('http://localhost:8000/services/databases', function (error, response, body) {
	  if (!error && response.statusCode == 200) {
		var databases = JSON.parse(body);
		for(var i=0; i < databases.length; i++){
			if(databases[i].cdcenabled == "1"){
				hookB.emit('*::databaseadded', databases[i]);
			}
		}
	  }
	})
}

function checktablesfordatachanges(dbname, tblname, ldn){
	
		var conn_str = config.dbconnection.replace("Database=master", "Database=" + dbname);
		var databasecdc = "SELECT * FROM cdc." + tblname + " where __$start_lsn > " + ldn;
		winston.log('info', databasecdc);
		
		(function(dbname, tblname, ldn){
			var datagram = [];
			var metadata = [];
			var currentObject = {};
			var rowcount = 0;
			var stmt = sql.query(conn_str, databasecdc);
			
			stmt.on('meta', function (meta) { metadata = meta;});
			
			stmt.on('row', function (idx) { 
					currentObject = {};
					rowcount++;
			});
			
			stmt.on('column', function (idx, data, more) { 
				if(idx == 0){
					ldn = ldnmanager.parseldn(data);
				}
				currentObject[metadata[idx].name] = data;
				if(idx == (Object.keys(metadata).length - 1)){
					currentObject.tablename = tblname;
					datagram.push(currentObject);
				}
			});
				
			stmt.on('done', function () {
				ldnmanager.saveldn(dbname, tblname, ldn, function(){
						console.log("saved ldn");
						if( datagram.length > 0 ){	
							//Send change to redis
							announce.emit( 'cdcevent', datagram );							
						}
				});
			});
			
			stmt.on('error', function (err) { 
				winston.log("checktablesfordatachanges had an error :-( " + err);
				winston.log("Disabling in memory: " + dbname + ':' + name + ':' + ldn);
			});
		})(dbname, tblname, ldn)
}

function requesttables(database){
	
	var databasename = database.name;
	request('http://localhost:8000/services/databases/' + databasename, function (error, response, body) {
	
	var tables = JSON.parse(body);
	winston.log('info', tables);
		for(var j = 0; j < tables.length; j++){
			var trackedObject = {};
				trackedObject.database = databasename;
				trackedObject.name = tables[j].name + "_" + tables[j].tablename + "_CT";
				
			if(tables[j].is_tracked_by_cdc == "1"){
				// Create a tracked object
				winston.log('info', 'Looking for config changes on ' + databasename + ':' + tables[j].tablename);
				//We have have to see if the tracked object is in our current list of tracked objects
				//if it isn't then add it
				
				var sqlcdc_conn_str = config.dbconnection.replace("Database=master", "Database=sqlcdc");
				var cdcdata = "SELECT * FROM tablestatus where tablename = '" + trackedObject.name + "' AND databasename = '" + databasename + "';";
				//winston.log('debug', cdcdata);
					
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
						checktablesfordatachanges(trkObj.database, trkObj.name, trkObj.ldn)
						//winston.log('info', 'Tracked ' + trkObj.name + ' to the tracked tables list with ldn ' + trkObj.ldn);
					});
					stmt.on('error', function (err) { winston.log('error',"requesttables had an error :-( " + err); });
				})(trackedObject);
		 }
	  }
	})
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

function remove(a, obj){
	var i =  a.length;
	while(i--){
		
		if ((a[i].database == obj.database) &&  (a[i].tablename == obj.tablename)){
		   //winston.log('info', 'Removing ' + obj.database + ' ' + obj.tablename + ' from table list');
           a.splice(i, 1);
		   return true;
       }
	}
	return false;
}
