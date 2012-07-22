sqlcdc
======
#MS SQL Server Change Data Capture For Node

This is an application to configure and broadcast Change Data Capture (CDC) through a simple web interface.
The goal is to emit these changes through a hook.io interface to enable remote application integration.

As this is SQL Server specific it will only run on windows with node. 

## Installation 
```
> git clone git@github.com:No9/sqlcdc.git
> cd sqlcdc
> npm install
```

## Configuration
Edit dbconf.json with the server you wish to manage Change Data Capture on
```
{
	"server" = "(local)"; 
}
```

## Usage
```
> node index.js 
``` 

On the server open [http://localhost:9000/config](http://localhost:9000/config)

