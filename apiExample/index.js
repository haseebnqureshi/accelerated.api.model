module.exports = (function() {

	//loading our model module
    var module = new require('accelerated.api.model')();

    //then customizing it to our current resource
    module.setSettings({
    	key: 'example',
    	name: 'Example Modeling',
    	schemaFilepath: __dirname + '/model-reql.json'
    	// schemaFilepath: __dirname + '/model-pg.json'
    });

    //then returning for use by accelerated.api
    return module;

})();