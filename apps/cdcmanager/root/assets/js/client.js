window.onload = function() {
	if (typeof XMLHttpRequest == "undefined")
  			XMLHttpRequest = function () {
    try { return new ActiveXObject("Msxml2.XMLHTTP.6.0"); }
      catch (e) {}
    try { return new ActiveXObject("Msxml2.XMLHTTP.3.0"); }
      catch (e) {}
    try { return new ActiveXObject("Microsoft.XMLHTTP"); }
      catch (e) {}
    //Microsoft.XMLHTTP points to Msxml2.XMLHTTP and is redundant
    throw new Error("This browser does not support XMLHttpRequest.");
  	};
}

function getQueryString() {
  var result = {}, queryString = location.search.substring(1),
      re = /([^&=]+)=([^&]*)/g, m;

  while (m = re.exec(queryString)) {
    result[decodeURIComponent(m[1])] = decodeURIComponent(m[2]);
  }

  return result;
}

function toggletablestatus(databasename, tablename, status, cb){
	
}

function toggledatabasestatus(databasename, status, cb){
	
		var request = {};
			request.databasename = databasename; 
			request.status = status; 
			request.type = "databasestatusupdate";
			
		var requeststring = JSON.stringify(request);
			
		var databasestatusrequest = new XMLHttpRequest();
			databasestatusrequest.open("POST", "/services/databases/" + getQueryString()["name"], true);
			databasestatusrequest.setRequestHeader("Content-type","application/json");
			
			databasestatusrequest.onreadystatechange = function() {
					if(databasestatusrequest.readyState == 4 && databasestatusrequest.status == 200) {
					    cb(databasestatusrequest.responseText)
					}
			}
			databasestatusrequest.send(requeststring);
}