
## Usage
This module serves as an easy-to-use template for creating any new resource object. It includes both its model and its routes! This module requires certain environment variables to be passed via ```env.json```. Right off the bat, you can use a relational database option (PostgreSQL) or a schema-less database option (RethinkDB):

```
"DB_CLIENT": "pg | reql"
"PG_HOST": ""
"PG_PORT": ""
"PG_USER": ""
"PG_PASSWORD": ""
"PG_DATABASE": ""
"REQL_HOST": ""
"REQL_PORT": ""
"REQL_DB": ""
```

Why start with PostgreSQL and RethinkDB? In our humble opinion, PostgreSQL is MySQL done better, with better query tools and an amazing ```JSON``` data type. RethinkDB is MongoDB done better, with seamless query building, a bad-ass data explorer, and performs better at scale and performance.


## Database Drivers
For convenience, we've added instant provisioning scripts to locally spin your next postgres or mysql database up. Just look in the directory ```provisioners``` and ```sudo su```, ```bash pg.sh``` or ```bash reql.sh```.

When you do this, refer to the bash script's database connection variables. As a shortcut, use these in your ```env.json```:

```
//PostgreSQL
"DB_CLIENT": "pg"
"PG_HOST": "localhost"
"PG_PORT": "5432"
"PG_USER": "root"
"PG_PASSWORD": "root"
"PG_DATABASE": "api"
```

```
//RethinkDB
"DB_CLIENT": "reql"
"REQL_HOST": "localhost"
"REQL_PORT": "9090"
"REQL_DB": "test"
```

## Database Table Creation
We even provide an easy way to create your database tables and your desired schema, using KnexJS's sql query builder. Simply alter your ```{DB_CLIENT}.schema.json``` with your table information. Three parameters are essential: 

```
{
	"table_name": "task",
	"primary_index": "task_id",
	"columns": {
		"task_id": "bigIncrements",
		"task_field": "string"
	}
}
```
Then run your node application with ```setup``` as an argument, and accelerated conditionally creates your table if it's not already created:

```
node index.js setup
```


## Quick Start
This repo is an easy-to-use npm template to create modules for accelerated.api. Simply clone this repo and:

1. Change your ```moduleKey``` and ```moduleName``` in index.js. (```moduleKey``` is a key that uniquely identies your module in the context of your app.)

2. Update your ```package.json``` with your information and module information.

3. Now actually create your module by utilizing the three CommonJS modules in this repo, ```middleware```, ```model```, and ```route```. Please note the structure and direct injected variables in each CommonJS module and what each is returning.

4. Run ```npm publish``` in your command line to publish directly onto npm, and viola! You've got a npm packaged module for accelerated.api.

## Using in accelerated.api
Okay, so how do you use this module in your accelerated.api project? Here's an example:

```

var api = require('accelerated.api');

var example = require('acceleratd.api.module');

api.useMiddlewares([ 
	[example.key, example.middleware]
]);

api.useModels([
	[example.key, example.model]
]);

api.useRoutes([
	[example.key, example.route]
]);

api.run();

```
