module.exports = function(model, express, app, models) {

	/*------
	Dependencies
	------------*/

	var path = require('path');
    var _ = require('underscore');

	/*------
	Driver Loader
	------------*/

	/*
	Just in case this gets attempted to run before any rethinkdb or 
	postgresql provisioning has occured, we safely run our provisioning
	scripts, so that the appropriate drivers exist.
	*/

	try {
		var package = process.env.DB_CLIENT;
		if (package == 'reql') { 
			package = 'rethinkdb';
		}
		require(package);
	}
	catch(err) {
		var path = require('path');
		var child = require('child_process');
		var filepath = path.join(__dirname, process.env.DB_CLIENT + '.sh');
		var command = 'sudo bash ' + filepath;
		child.exec(command);
		console.log('Sit tight! Accelerated is installing your required database libraries. (In the future, we\'ll have a progress bar or something to that effect.)');
		process.exit(1);
	}

	/*------
	Switcher
	------------*/

	/*
	Safely attempting to load presumed DB_CLIENT for model, and throwing
	error if something went wrong.
	*/

	var filepath = path.join(__dirname, process.env.DB_CLIENT + '.js');

	try {
		model = require(filepath);
	}
	catch(err) {
		throw err;
	}

    //call model's _setup if argument is passed 
    if (_.indexOf(process.argv, 'setup') > -1) {
        model()._setup();
    }

	/*------
	Returning Model
	------------*/

	return model;

};