
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

```

var api = require('accelerated.api');

var apiModel = new require('acceleratd.api.model')();

api.useMiddlewares([ 
	[apiModel.key, apiModel.middleware]
]);

api.useRoutes([
	[apiModel.key, apiModel.route]
]);

api.run();

```

