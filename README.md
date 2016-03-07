
## Usage
This module serves as an easy-to-use template for creating any new resource object. It includes both its model and its routes! This module requires certain environment variables to be passed via ```env.json```:

```
"DB_CLIENT": "pg | mysql"
"DB_HOST": ""
"DB_PORT": ""
"DB_USER": ""
"DB_PASSWORD": ""
"DB_DATABASE": ""
```

## Database Drivers
For convenience, we've added instant provisioning scripts to locally spin your next postgres or mysql database up. Just look in the directory ```provisioners``` and ```sudo su```, ```bash pg.sh``` or ```bash mysql.sh```.

When you do this, refer to the bash script's database connection variables. As a shortcut, use these in your ```env.json```:

```
"DB_CLIENT": "pg"
"DB_HOST": "localhost"
"DB_PORT": "5432"
"DB_USER": "root"
"DB_PASSWORD": "root"
"DB_DATABASE": "api"
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
