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
		to install our specific node driver.
		*/

		var path = require('path');
		var filepath = path.join(__dirname, 'install-' + (process.env.DB_CLIENT || 'reql') + '.sh');
		require('child_process').exec('sudo bash ' + filepath);

		//let you know
		console.log('Sit tight! Accelerated is installing your required database libraries. (In the future, we\'ll have a progress bar or something to that effect.)');
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

		console.log({
			message: 'Looks like there wasn\'t a valid schema at your schemaFilepath! Please define "schemaFilepath" in your module settings when inheriting this module.',
			"settings.schemaFilepath": settings.schemaFilepath,
			err: err
		});
		process.exit(1);
	}

	/*------
	Model Switcher
	------------*/

	/*
	Safely attempting to load presumed DB_CLIENT for model, and throwing
	error if something went wrong.
	*/

	var filepath = path.join(__dirname, 'model-' + process.env.DB_CLIENT + '.js');

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