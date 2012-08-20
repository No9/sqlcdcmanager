sqlcdc
======
#MS SQL Server Change Data Capture For Node

This is an application to configure and broadcast Change Data Capture (CDC) through a simple web interface.
The goal is to emit these changes through a socket.io server to enable data driven applications written on alternative technology stacks to leverage node.js.

As this is SQL Server specific it will only run on windows with node. 

## Installation 
```
> git clone git@github.com:No9/sqlcdc.git
> cd sqlcdc
> npm install
> osql -E -i .\sqlscripts\Generate_cdcsql_database.sql
```
Open a new command prompt as Administrator 
```
> net start "SQL Server Agent (MSSQLSERVER)"
```
Or open SQL Server management studio and make sure the SQL Server Agent Is Running.

## Start The Service
```
> node index.js 
``` 

## Configuration Of Sample
On the server open [http://localhost:9000/config](http://localhost:9000/config)
Click the Databases link at the top of the page.
Select the database you want to enable change data capture on
![Enable Change Data Capture](http://farm8.staticflickr.com/7133/7827235140_19561b8dae.jpg "CDC Database List")
On the database configuration page toggle the database
![Toggle The Database](http://farm9.staticflickr.com/8442/7827273968_b128ccafd6.jpg "Toggle The Database")
Your node console should so that the database has been added
![Toggle The Database](http://farm9.staticflickr.com/8439/7827293440_9c955bdf33.jpg "Database Added")
Now enable a table for change data capture by clicking on the red X next to the table you wish to enable.
(N.B. the tables that are greyed out are internal system tables used by SQL Server Change Data Capture.
![Select Table](http://farm9.staticflickr.com/8287/7827310526_ef77436322.jpg "Selected Tables")


