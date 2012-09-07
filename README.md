sqlcdc
======
#MS SQL Server Change Data Capture For Node

This is an application to configure and broadcast Change Data Capture (CDC) through a simple web interface.
The goal is to emit these changes through a socket.io server to enable data driven applications written on Microsoft technology stacks to leverage node.js.

As this is SQL Server specific it will only run on windows with node.

## Installation 
sqlcdc is capable of running on a seperate host than the actual database server this section will outline the steps that have to be performed on the database and the application server as seperate steps to illustrate this point. 
However sqlcdc can also be ran on the same machine as the database server. 

### Database Server
On the machine where SQL Server 2008 or Above is installed perform the following:
```
> git clone git@github.com:No9/sqlcdc.git
> cd sqlcdc
> npm install
> osql -E -i .\sqlscripts\Generate_cdcsql_database.sql
```

You can also just copy the ```Generate_cdcsql_database.sql``` to the server rather than installing git.

Open a new command prompt as Administrator 
```
> net start "SQL Server Agent (MSSQLSERVER)"
```

Or open SQL Server management studio and make sure the SQL Server Agent Is Running.

### Application Server

On the application server in the location you wish to install sqlcdc run:
```
> git clone git@github.com:No9/sqlcdc.git
> cd sqlcdc
> npm install
```

You may want to change config.json in the root directory of your database server.
The config file points to the local instance so if you are running sqlcdc on the same machine as the database nothing needs to be done.
```
"dbconnection" : "Driver={SQL Server Native Client 11.0};Server=NAME_OR_IP_OF_SQLSERVER;Database=master;Trusted_Connection={Yes}"
```

![Install the redis for windows](https://github.com/MSOpenTech/Redis "Redis Windows")

**Start Redis as per your requirements**
If you are just running the sample then double click on the redis-server.exe 

Start The Service
```
> node index.js 
``` 

Start the clustered socket.io instances
```
> cd services
> node socketservicecluster.js
```



## Configuration Of Sample

Run the script in the samples folder to create the movie database
```
> osql -E -i .\SampleApp\sql\moviedb.sql
```

On the server open [http://localhost:9000/config](http://localhost:9000/config)

Click the Databases link at the top of the page.

Select the database you want to enable change data capture on

![Enable Change Data Capture](http://farm8.staticflickr.com/7133/7827235140_19561b8dae.jpg "CDC Database List")

On the database configuration page toggle the database CDC Status
![Toggle The Database](http://farm9.staticflickr.com/8442/7827273968_b128ccafd6.jpg "Toggle The Database")

Your node console should show that the database has been added
![Toggle The Database](http://farm9.staticflickr.com/8439/7827293440_9c955bdf33.jpg "Database Added")

Now enable a table for change data capture by clicking on the red X next to the table you wish to enable.
(N.B. the tables that are greyed out are internal system tables used by SQL Server Change Data Capture.
![Select Table](http://farm9.staticflickr.com/8287/7827310526_ef77436322.jpg "Selected Tables")

Open the MvcMovieCS_TU.sln in SampleApp\C#
Run the application in the debugger
Open up another screen pointing to the same URL
Add a new movie in one screen and the same movie should update in the other screen automatically. 
![Final Screens](http://farm9.staticflickr.com/8306/7827426994_9381e45930.jpg "Completed Screens")

Please look at _Layout.cshtml for the additional javascript code that makes this possible.
**N.B. This does not require any additional node.js code in the main MVC solution**

##License

(The MIT License)

Copyright (c) 2012 Anthony Whalley

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
