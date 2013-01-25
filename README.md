# sqlcdcmanager

## MS SQL Server Change Data Capture For sqlcdc-stream

This is an application to configure Change Data Capture (CDC) through a simple web interface.

As this is SQL Server specific it will only run on windows with node.

## Installation 

On the machine where SQL Server 2008 or Above is installed perform the following:

```
npm install sqlcdcmanager
cd sqlcdcmanager
osql -E -i node_modules\sqlcdcmanager\sqlscripts\Generate_cdcsql_database.sql
```

Open a new command prompt as Administrator 
```
net start "SQL Server Agent (MSSQLSERVER)"
```

Or open SQL Server management studio and make sure the SQL Server Agent Is Running.

You may want to change config.json in the root directory of the install.
The config file points to the local instance so if you are running sqlcdc on the same machine as the database nothing needs to be done.
```
"dbconnection" : "Driver={SQL Server Native Client 11.0};Server=NAME_OR_IP_OF_SQLSERVER;Database=master;Trusted_Connection={Yes}"
```

![Install the redis for windows](https://github.com/MSOpenTech/Redis "Redis Windows")

**Start Redis as per your requirements**
If you are just running the sample then double click on the redis-server.exe 

Start The Service
```
node node_modules/sqlcdcmanager/index.js 
``` 

##License

(The MIT License)

Copyright (c) 2012 Anthony Whalley

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
