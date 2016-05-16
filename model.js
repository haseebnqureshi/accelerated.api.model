module.exports = function(model, express, app, models, settings) {

	/*------
	Dependencies
	------------*/

	var path = require('path');
    var _ = require('underscore');
    var extendModel;

	/*------
	DB Driver Loader
	------------*/

	/*
	Just in case this gets attempted to run before any rethinkdb or 
	postgresql provisioning has occured, we safely run our provisioning
	scripts, so that the appropriate drivers exist.
	*/

	try {

		//so we attempt to load our node bindings
		switch (process.env.DB_CLIENT) {
			case 'pg':
				require('pg');
			break;
			case 'reql':
				require('rethinkdb');
			break;

			//we default to rethinkdb
			default:
				require('rethinkdb');
		}
	}
	catch(err) {

		/*
		Since something failed while loading db drivers, we make sure 
		to let user know what actions to take, in installing the right
		driver.
		*/

		console.log("Looks like you don't have the right db drivers and/or node drivers needed! No problem, here's how to fix it. Simply copy and paste the following code into terminal, while in your project directory path:");
		console.log("");
		console.log("cd node_modules/accelerated.api.model && npm run-script " + (process.env.DB_CLIENT || 'reql') + " ./../../ && cd ../../");
		console.log("");
		process.exit(1);
	}

	/*------
	Model Schema Loader
	------------*/

	/*
	With each model, we need to find the user-defined model schema
	that allows us to safely implement our CRUD abilities against 
	the user-defined resource.
	*/

	//loading our table schema at user-defined filepath
	try {
		settings.schema = require(settings.schemaFilepath);
	}
	catch(err) {

		/*
		The purpose of this module is to allow other accelerated modules
		to inherit this, and then add slight modifications and custom 
		schema, so that it's a rapid-fire CRUD module.

		To that point, we refuse to load standard or default schemas, 
		because that doesn't get you anywhere you need to be!

		Instead, we alert you and exit out of the application, so you 
		are fully aware that you should define your schemaFilepath
		when inheriting this module.
		*/

		console.log("Looks like there wasn't a valid schema at schemaFilepath! Make sure 'schemaFilepath' is defined in your module settings when inheriting this module, and that it has valid JSON.");
		console.log('settings.schemaFilepath', settings.schemaFilepath);
		console.log(err);
		process.exit(1);
	}

	/*------
	Model Switcher
	------------*/

	/*
	Safely attempting to load presumed DB_CLIENT for model, and throwing
	error if something went wrong.
	*/

	var filepath = path.join(__dirname, 'model-' + (process.env.DB_CLIENT || 'reql') + '.js');

	try {
		extendModel = require(filepath);
	}
	catch(err) {
		throw err;
	}

    //call model's _setup if argument is passed 
    if (_.indexOf(process.argv, 'setup') > -1) {
        extendModel(model, express, app, models, settings)._setup();
    }

	/*------
	Returning Model Extension Callback
	------------*/

	return extendModel;

};