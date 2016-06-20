module.exports = function(settings) {

	return function(model, express, app, models) {

		/*------
		Dependencies
		------------*/

		var _ = require('underscore');
		var path = require('path');
		var logger = app.get('logger');
		var helpers = {};
		helpers.r = require('rethinkdb');

		/*------
		Helpers
		------------*/

		/*
		Easy query helper to create our database connection to our one 
		database, without thinking about it. Take the resulting connection
		and .run(connection, callback) in your queries.
		*/

		helpers.query = function(connectionCallback) {
			helpers.r.connect({
				host: (process.env.RETHINKDB_HOST || 'localhost'),
				port: (process.env.RETHINKDB_PORT || 28015),
				db: (process.env.RETHINKDB_DB || 'test')
			}, function(err, connection) {
				if (err) {
					throw err;
				}
				if (connectionCallback) {
					return connectionCallback(connection);
				}
			});
		};

		/*
		General whitelisting, so that we can accept any req.body request and
		safely parse our arguments, without any extra code.
		*/

		helpers.whitelist = function(args, scenario) {

			//loading our specified whitelist array
			var keys = settings.schema.whitelist[scenario];

			//if keys are undefined, try loading default
			if (!keys) {
				keys = settings.schema.whitelist['default'];
			}

			//if default keys are undefined, we return no args
			if (!keys) {
				return {};
			}

			//cherry-picking arguments whose key is whitelisted
			return _.pick(args, function(value, key) {
				return (_.indexOf(keys, key) > -1);
			});
		};

		/*------
		Defining Model
		------------*/

		model = {

			_setup: function(onSuccess, onError) {

				console.log('[_setup] Conditionally creating table: "' + settings.schema.table_name + '"');

				//list all tables and see if our table has been created
				helpers.query(function(connection) {
					helpers.r.tableList()
						.run(connection, function(err, result) {
							var tableExists = _.indexOf(result, settings.schema.table_name) > -1 ? true : false;

							//if table doesn't exist, we create our table using loaded settings.schema options
							if (!tableExists) {

								console.log('[_setup] Table: "' + settings.schema.table_name + '" does not exist');

								helpers.r.tableCreate(settings.schema.table_name, {
									primaryKey: settings.schema.primary_key || 'id',
									durability: settings.schema.durability || 'hard'
								})
								.run(connection, function(err, result) {
									if (err) {

										console.log('[_setup] Failed to create table: "' + settings.schema.table_name + '"');

										if (onError) {
											return onError(err);
										}
									}
									if (result.tables_created > 0) {

										console.log('[_setup] Successfully created table: "' + settings.schema.table_name + '"');

										if (onSuccess) {
											return onSuccess(result);
										}
									}
								});
							}
							else {

								console.log('[_setup] Table: "' + settings.schema.table_name + '" is verified to exist');

							}
						});
				});
			},

			create: function(args, onSuccess, onError) {
				helpers.query(function(connection) {
					helpers.r.table(settings.schema.table_name)
						.insert(helpers.whitelist(args), {
							durability: 'hard',
							returnChanges: 'always',
							conflict: 'error'
						})
						.run(connection, function(err, result) {
							if (err && onError) { 
								return onError(err);
							}
							if (onSuccess) {
								if (result.inserted > 0) {
									var row = result.changes[0].new_val;
									return onSuccess([row]);
								}
								else {
									return onError(result);
								}
							}
						});
				});
			},

			delete: function(id, onSuccess, onError) {
				helpers.query(function(connection) {

					//ensuring filter is run with primary_key and vlue
					var where = {};
					where[settings.schema.primary_key] = id;

					//executing query
					helpers.r.table(settings.schema.table_name)
						.filter(where)
						.delete({
							durability: 'hard',
							returnChanges: false,
						})
						.run(connection, function(err, result) {
							if (err && onError) { 
								return onError(err);
							}
							if (onSuccess) {
								if (result.deleted > 0) {
									return onSuccess([]);
								}
								else {
									return onError(result);
								}
							}
						});
				});
			},

			deleteWhere: function(where, onSuccess, onError) {
				helpers.query(function(connection) {
					helpers.r.table(settings.schema.table_name)
						.filter(helpers.whitelist(where))
						.delete({
							durability: 'hard',
							returnChanges: false,
						})
						.run(connection, function(err, result) {
							if (err && onError) { 
								return onError(err);
							}
							if (onSuccess) {
								if (result.deleted > 0) {
									return onSuccess([]);
								}
								else {
									return onError(result);
								}
							}
						});
				});
			},

			get: function(id, onSuccess, onError) {
				helpers.query(function(connection) {

					//ensuring filter is run with primary_key and vlue
					var where = {};
					where[settings.schema.primary_key] = id;

					//executing query
					helpers.r.table(settings.schema.table_name)
						.filter(where)
						.run(connection, function(err, cursor) {
							if (err && onError) { 
								return onError(err);
							}
							if (onSuccess) {
								cursor.r.toArray(function(err, rows) {
									if (err && onError) { 
										return onError(err);
									}
									return onSuccess(rows);
								});	
							}
						});
				});
			},

			getAll: function(onSuccess, onError) {
				helpers.query(function(connection) {
					helpers.r.table(settings.schema.table_name)
						.run(connection, function(err, cursor) {
							if (err && onError) { 
								return onError(err);
							}
							if (onSuccess) {
								cursor.r.toArray(function(err, rows) {
									if (err && onError) { 
										return onError(err);
									}
									return onSuccess(rows);
								});	
							}
						});
				});
			},

			getAllWhere: function(where, onSuccess, onError) {
				helpers.query(function(connection) {
					helpers.r.table(settings.schema.table_name)
						.filter(helpers.whitelist(where))
						.run(connection, function(err, cursor) {
							if (err && onError) { 
								return onError(err);
							}
							if (onSuccess) {
								cursor.r.toArray(function(err, rows) {
									if (err && onError) { 
										return onError(err);
									}
									return onSuccess(rows);
								});	
							}
						});
				});
			},

			update: function(id, args, onSuccess, onError) {
				helpers.query(function(connection) {

					//ensuring filter is run with primary_key and vlue
					var where = {};
					where[settings.schema.primary_key] = id;

					//executing query
					helpers.r.table(settings.schema.table_name)
						.filter(where)
						.update(helpers.whitelist(args), {
							durability: 'hard',
							returnChanges: 'always'
						})
						.run(connection, function(err, result) {
							if (err && onError) { 
								return onError(err);
							}
							if (onSuccess) {
								if (result.replaced > 0) {
									var row = result.changes[0].new_val;
									return onSuccess([row]);
								}
								return onSuccess([]);
							}
						});
				});
			},

			updateWhere: function(where, args, onSuccess, onError) {
				helpers.query(function(connection) {
					helpers.r.table(settings.schema.table_name)
						.filter(helpers.whitelist(where))
						.update(helpers.whitelist(args), {
							durability: 'hard',
							returnChanges: 'always'
						})
						.run(connection, function(err, result) {
							if (err && onError) { 
								return onError(err);
							}
							if (onSuccess) {
								if (result.replaced > 0) {
									var rows = _.map(result.changes, function(change) {
										return change.new_val;
									});
									return onSuccess(rows);
								}
								return onSuccess([]);
							}
						});
				});
			}

		};

		/*------
		Filtering Model -- allowing any callback to modify default CRUD modeling
		------------*/

		if (settings.filterModel) {
			try {
				model = settings.filterModel(model, helpers, settings, _, logger);
			}
			catch(err) {
				logger.warn('Failed to filter model!');
			}
		}

		/*------
		Returning Model
		------------*/

		return model;

	};

};