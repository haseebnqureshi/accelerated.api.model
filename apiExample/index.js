module.exports = (function() {

	//loading our model module
    var module = new require('accelerated.api.model')();

    //then customizing it to our current resource
    module.setSettings({
    	key: 'example',
    	name: 'Example Modeling',
        schemaFilepath: __dirname + '/model-' + (process.env.DB_CLIENT || 'pg') + '.json',
        filterModel: function(model, helpers, settings, _, logger) {
            logger.debug({ model: model });
            return model;
        },
        filterRoutes: function(routes, model, models, settings, _, logger) {
            logger.debug({ routes: routes });
            return routes;
        }
    });

    //then returning for use by accelerated.api
    return module;

})();