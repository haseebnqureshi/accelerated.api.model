module.exports = function(model, express, app, models) {

	/*------
	Dependencies
	------------*/

	var path = require('path');

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

	/*------
	Returning Model
	------------*/

	return model;

};