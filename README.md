
## About
This provides an easy-to-use and very fast start to creating any API resources. This module bootstraps a resource's model and routes.

## Postgres & RethinkDB
For now, you have the option of using either Postgres or RethinkDB. For those who might not be acquainted, RethinkDB is similar to MongoDB, but handles scale much better and has a slew of great things with it.

## env.json
By default, this module loads the appropriate database credentials for both Postgres and RethinkDB. By default, this module uses RethinkDB over Postgres. You can override and define general database connection variables in your Accelerated ```env.json``` using the following keys:

```
"DB_CLIENT": "pg | reql"
"PG_HOST": "localhost"
"PG_PORT": "5432"
"PG_USER": "root"
"PG_PASSWORD": "root"
"PG_DATABASE": "api"
"REQL_HOST": "localhost"
"REQL_PORT": "28015"
"REQL_DB": "test"
```

## Usage
Once you've got this module saved via NPM, you can use the following commands to:

Install an example module that inherits this modeling, quickly allowing you to build your resource. Copy-and-paste into terminal while in your node project directory:

```
cd node_modules/accelerated.api.model && npm run-script example ./../../ && cd ../../
```

Install required drivers and configuring Postgres on your machine. Copy-and-paste into terminal while in your node project directory:

```
cd node_modules/accelerated.api.model && npm run-script pg ./../../ && cd ../../
```

Install required drivers and configuring RethinkDB on your machine. Copy-and-paste into terminal while in your node project directory:

```
cd node_modules/accelerated.api.model && npm run-script reql ./../../ && cd ../../
```

## Example Inheritance
Highly recommend running the example module command above. Once you run this command, Accelerated copies an example ```apiExample``` module into your project folder. This inherits ```accelerated.api.model``` and shows how you can easily create a resource.

You'll notice two JSON files. These JSON files are mentioned by ```index.js``` and define your resource's model schema. Modify these for Accelerated to appropriately manage your new resource.

## Table Schema Creation
When you modify those JSON files, and you do not have your tables (and/or columns) defined in your database, simply pass ```setup``` when running your application. Accelerated will read the flag and then conditionally create the tables, so that your resources have the appropriate db resources needed.

```
node index.js setup
```

## Using in Accelerated
Make sure you load your module, and at minimum, pass its model and route into yoru Accelerated application.

```
var api = require('accelerated.api');
var apiExample = require('./apiExample').use();

api.useModels([ 
	[apiExample.key, apiExample.model]
]);

api.useRoutes([
	[apiExample.key, apiExample.route]
]);

api.run();
```

