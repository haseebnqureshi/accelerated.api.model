
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
