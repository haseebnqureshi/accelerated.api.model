module.exports = function() {

    // you can require this or other modules using accelerated.api.module 
    var module = new require('accelerated.api.module')();
    
    // set your module's key for reference by middlwares, models, and routes 
    module.setKey('model');

    // set your module's name for logging output 
    module.setName('Model Module');

    // you can choose to extend your module's model
    module.extendModel(function(model, express, app, models) {

    	// choosing to keep model isolated into another commonjs module
		model = require('./model.js')(model, express, app, models);    	

        // modify model to include user create, retrieve, update, and delete methods
        return model;

    });

    // you can choose to extend your module's routes
    module.appendRoute(function(express, app, models) {

    	// choosing to keep model isolated into another commonjs module
		app = require('./route.js')(express, app, models, module.key);    	

        // modify app to include user CRUD routes 
        return app;

    });

    return module;

};