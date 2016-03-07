module.exports = (function() {

	var moduleKey = 'test';
	var moduleName = 'test';

	/* Careful - don't modify below unless you're sure! */

	var Module = {

		key: moduleKey,

		name: moduleName,

		middleware: require('./middleware'),

		model: require('./model'),

		route: require('./route')
	
	};

	/* Call model's _setup if argument is passed */

	var _ = require('underscore');

	if (_.indexOf(process.argv, 'setup') > -1) {

		Module.model()()._setup();

	}

	return Module;

})();