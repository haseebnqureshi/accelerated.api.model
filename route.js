module.exports = function(express, app, models, settings) {

	var _ = require('underscore');
	var logger = app.get('logger');
	var model = models[settings.key];
	var routes = {};

	/*------
	Routes
	All routes get stored into an object. This allows for later
	manipulation of routes. Each "route" is an Express middleware
	function, accepting req and res objects.
	------------*/

	routes['/'] = {
		post: function(req, res) {
			logger.debug('req.body', req.body);
			model.create(req.body, function(rows) {
				logger.debug('rows', rows);
				return res.status(201).send({
					data: rows[0]
				});
			}, function(err) {
				logger.error('err', err);
				return res.status(500).send({
					data: [],
					error: err
				});
			});
		},
		get: function(req, res) {
			model.getAll(function(rows) {
				logger.debug('rows', rows);
				return res.status(200).send({
					data: rows
				});
			}, function(err) {
				logger.error(err);
				return res.status(500).send({
					data: [],
					error: err
				});
			});
		}
	};

	routes['/:resource_id'] = {
		get: function(req, res) {
			logger.debug('req.params', req.params);

			model.get(req.params.resource_id, function(rows) {
				logger.debug('rows', rows);

				//return 404 if no rows were found
				var status = rows.length > 0 ? 200 : 404;
				return res.status(status).send({
					data: rows
				});
			}, function(err) {
				logger.error('err', err);
				return res.status(500).send({
					data: [],
					error: err
				})
			});
		},
		put: function(req, res) {
			logger.debug('req.params', req.params);
			logger.debug('req.body', req.body);

			model.update(req.params.resource_id, req.body, function(rows) {
				logger.debug('rows', rows);
				return res.status(200).send({
					data: rows
				});
			}, function(err) {
				logger.error('err', err);
				return res.status(500).send({
					data: [],
					error: err
				})
			});

		},
		delete: function(req, res) {
			logger.debug('req.params', req.params);

			model.delete(req.params.resource_id, function() {
				return res.status(200).send({
					data: []
				});
			}, function(err) {
				logger.error('err', err);
				return res.status(500).send({
					data: [],
					error: err
				})
			});
		}
	};

	routes['/:property/:value'] = {
		get: function(req, res) {
			logger.debug('req.params', req.params);

			//constructing our where object
			var where = {};
			where[req.params.property] = req.params.value;
			logger.debug('where', where);

			//executing our query
			model.getAllWhere(where, function(rows) {
				logger.debug('rows', rows);

				//return 404 if no rows were found
				var status = rows.length > 0 ? 200 : 404;
				return res.status(status).send({
					data: rows
				});
			}, function(err) {
				logger.error('err', err);
				return res.status(500).send({
					data: [],
					error: err
				})
			});
		},
		put: function(req, res) {
			logger.debug('req.params', req.params);
			logger.debug('req.body', req.body);

			//constructing our where object
			var where = {};
			where[req.params.property] = req.params.value;
			logger.debug('where', where);

			//executing our query
			model.updateWhere(where, req.body, function(rows) {
				logger.debug('rows', rows);
				return res.status(200).send({
					data: rows
				});
			}, function(err) {
				logger.error('err', err);
				return res.status(500).send({
					data: [],
					error: err
				})
			});
		},
		delete: function(req, res) {
			logger.debug('req.params', req.params);

			//constructing our where object
			var where = {};
			where[req.params.property] = req.params.value;
			logger.debug('where', where);

			//executing our query
			model.deleteWhere(where, function() {
				return res.status(200).send({
					data: []
				});
			}, function(err) {
				logger.error('err', err);
				return res.status(500).send({
					data: [],
					error: err
				})
			});
		}
	};

	/*------
	Filtering Routes -- allowing any callback to modify default routing
	------------*/

	if (settings.filterRoutes) {
		try {
			routes = settings.filterRoutes(routes, model, models, settings, _, logger, app, express);
		}
		catch(err) {
			logger.warn('Failed to filter routes!');
		}
	}


	/*------
	Filling Routes into our Router
	------------*/

	var router = express.Router();
	_.each(routes, function(route, path) {
		_.each(route, function(func, method) {
			try {
				router.route(path)[method](func);
			}
			catch(err) {
				logger.warn('Something went wrong in adding route!', {
					path: path,
					method: method
				});
			}
		});
	});


	/*------
	Mounting Router onto App
	------------*/

	// we're opining on prefixing everything here with our key
	app.use('/' + settings.key, router);


	/*------
	Returning App (ensuring app waterfalls)
	------------*/

	return app;

};