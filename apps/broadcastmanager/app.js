var request = require('request');
var sql = require('node-sqlserver');

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
									trackedtables.push(trackedObject);		
								}
							}
					}
				})
}

function checktablesfordatachanges(){
	for(var i=0;i < trackedtables.length;i++){
		console.log("Tracked Database : " + trackedtables[i].database);
		var conn_str = "Driver={SQL Server Native Client 11.0};Server=(local);Database=" + trackedtables[i].database + ";Trusted_Connection={Yes}";
		var databasecdc = "SELECT * FROM cdc." + trackedtables[i].name;
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
				var datagram = "[";
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
				datagram += "]";
			});
		});	
	}
}

