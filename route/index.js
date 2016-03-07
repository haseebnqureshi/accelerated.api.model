module.exports = function(express, app, models) {

	/*------
	Dependencies
	------------*/

	var name = 'test';

	/*------
	Helpers
	------------*/



	/*------
	Routes
	------------*/

	var router = express.Router();

	router.route('/')

		//create new resource
		.post(function(req, res) {

			models[name]().create(req.body, function(rows) {
				return res.status(201).send({
					data: rows[0]
				});
			}, function(err) {
				return res.status(500).send({
					data: [],
					error: err
				});
			});
		})

		//getting collection of resource
		.get(function(req, res) {
			models[name]().getAll(function(rows) {
				return res.status(200).send({
					data: rows
				});
			}, function(err) {
				return res.status(500).send({
					data: [],
					error: err
				});
			});
		});

	router.route('/:resource_id')

		//getting individual resource by id
		.get(function(req, res) {

			models[name]().get(req.params.resource_id, function(rows) {

				//return 404 if no rows were found
				var status = rows.length > 0 ? 200 : 404;
				return res.status(status).send({
					data: rows
				});
			}, function(err) {
				return res.status(500).send({
					data: [],
					error: err
				})
			});
		})

		//updating individual resource by id
		.put(function(req, res) {

			models[name]().update(req.params.resource_id, req.body, function(rows) {
				return res.status(200).send({
					data: rows
				});
			}, function(err) {
				return res.status(500).send({
					data: [],
					error: err
				})
			});
		})

		//deleting individual resource by id
		.delete(function(req, res) {

			models[name]().delete(req.params.resource_id, function() {
				return res.status(200).send({
					data: []
				});
			}, function(err) {
				return res.status(500).send({
					data: [],
					error: err
				})
			});
		});

	router.route('/:property/:value')

		.get(function(req, res) {

			//constructing our where object
			var where = {};
			where[req.params.property] = req.params.value;

			//executing our query
			models[name]().getAllWhere(where, function(rows) {

				//return 404 if no rows were found
				var status = rows.length > 0 ? 200 : 404;
				return res.status(status).send({
					data: rows
				});
			}, function(err) {
				return res.status(500).send({
					data: [],
					error: err
				})
			});
		})

		.put(function(req, res) {

			//constructing our where object
			var where = {};
			where[req.params.property] = req.params.value;

			//executing our query
			models[name]().updateWhere(where, req.body, function(rows) {
				return res.status(200).send({
					data: rows
				});
			}, function(err) {
				return res.status(500).send({
					data: [],
					error: err
				})
			});
		})

		.delete(function(req, res) {

			//constructing our where object
			var where = {};
			where[req.params.property] = req.params.value;

			//executing our query
			models[name]().deleteWhere(where, function() {
				return res.status(200).send({
					data: []
				});
			}, function(err) {
				return res.status(500).send({
					data: [],
					error: err
				})
			});
		});

	app.use('/test', router);

	/*------
	Returning App (ensuring app waterfalls)
	------------*/

	return app;

};