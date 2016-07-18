module.exports = function(settings) {

	return function(model, express, app, models) {

		/*------
		Dependencies
		------------*/

		var _ = require('underscore');
		var pg = require('pg');
		var types = require('pg').types;
		var path = require('path');
		var helpers = {};

		//@see http://knexjs.org for knex query builder documentation
		helpers.knex = require('knex')({ client: 'pg' });

		/*------
		Helpers
		------------*/

		var logger = app.get('logger');

		/*
		Setting types parsing for our pg queries, so that any data coming 
		back is respecting our column data types.
		*/

		types.setTypeParser(20, function(val) {
			return parseInt(val);
		});

		/* 
		Using the process.env variables, we create our PG connection string
		that gets used to execute queries against.
		*/

		helpers.getConnectionString = function() {
			return 'postgres://'
				+ (process.env.PG_USER || 'root') + ':'
				+ (process.env.PG_PASSWORD || 'root') + '@'
				+ (process.env.PG_HOST || 'localhost') + ':'
				+ (process.env.PG_PORT || 5432).toString() + '/'
				+ (process.env.PG_DATABASE || 'api');
		};

		/*
		Instead of relying on KnexJS, we're using the native pg drivers to make
		DB connections and return data, while using KnexJS for strictly query
		building.
		*/

		helpers.query = function(statement, onSuccess, onError) {
			pg.connect(helpers.getConnectionString(), function(err, client, done) {
				if (err) { throw err; }

				logger.info(statement);

				//execute statement against database, already treated with vars
				client.query(statement, [], function(err, result) {

					//finished with db connection, may want to pass this through as optional
					done();

					//handling errors
					if (err && onError) { 
						return onError(err);
					}

					//passing rows through success handler
					if (onSuccess) {
						return onSuccess(result.rows);
					}
				});
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

		/*
		General helper that gets called on returning anything in the model below,
		for easy model-wide rule-defining returning rules.
		*/

		helpers.safeReturning = function(scenario) {
			switch (scenario) {
				default:
					return '*';
			}
		};


		/* 
		General helpers for modifying timestamps showing when resources have been
		created and modified.
		*/

		helpers.filterTimestamp = function(suffix, args) {
			var key = settings.schema.table_name + suffix;
			try {
				if (settings.schema.columns[key]) {
					args[key] = new Date().getTime() / 1000;
				}
			}
			catch (err) { }
			return args;
		};

		/*------
		Defining Model
		------------*/

		model = {

			_setup: function(onSuccess, onError) {

				console.log('[_setup] Conditionally creating table: "' + settings.schema.table_name + '"');

				//crafting query
				var statement = helpers.knex.schema
					.createTableIfNotExists(settings.schema.table_name, function(table) {

						//iterates through columns
						_.each(settings.schema.columns, function(column) {

							console.log('[_setup] Modifying query to create column: "' + column[0] + '" with data type: "' + column[1] + '"');

							//creates column with appropriate type
							table[column[1]](column[0]);
						});
					})
					.toString();

				//executing query
				helpers.query(statement, function(rows) {

					console.log('[_setup] Table: "' + settings.schema.table_name + '" is verified to exist');

					if (onSuccess) {
						return onSuccess(rows);
					}
				}, function(err) {

					console.log('[_setup] Failed creating table: "' + settings.schema.table_name + '"');
					console.log('[_setup]', err);

					if (err && onError) {
						return onError(err);
					}
				});
			},

			create: function(args, onSuccess, onError) {

				args = helpers.filterTimestamp('_created', args);

				//crafting query
				var statement = helpers.knex
					.table(settings.schema.table_name)
					.insert(helpers.whitelist(args))
					.returning(helpers.safeReturning())
					.toString();

				//executing query
				helpers.query(statement, function(rows) {
					if (onSuccess) {
						return onSuccess(rows);
					}
				}, function(err) {
					if (err && onError) {
						return onError(err);
					}
				});
			},

			delete: function(id, onSuccess, onError) {

				//crafting query
				var statement = helpers.knex
					.table(settings.schema.table_name)
					.where(settings.schema.primary_key, id)
					.delete()
					.toString();

				//executing query
				helpers.query(statement, function(rows) {
					if (onSuccess) {
						return onSuccess();
					}
				}, function(err) {
					if (err && onError) {
						return onError(err);
					}
				});
			},

			deleteWhere: function(where, onSuccess, onError) {
				
				//crafting query
				var statement = helpers.knex
					.table(settings.schema.table_name)
					.where(helpers.whitelist(where))
					.delete()
					.toString();

				//executing query
				helpers.query(statement, function(rows) {
					if (onSuccess) {
						return onSuccess();
					}
				}, function(err) {
					if (err && onError) {
						return onError(err);
					}
				});
			},

			get: function(id, onSuccess, onError) {
				
				//crafting query
				var statement = helpers.knex
					.table(settings.schema.table_name)
					.where(settings.schema.primary_key, id)
					.orderBy(settings.schema.primary_key, 'desc')
					.returning(helpers.safeReturning())
					.toString();

				//executing query
				helpers.query(statement, function(rows) {
					if (onSuccess) {
						return onSuccess(rows);
					}
				}, function(err) {
					if (err && onError) {
						return onError(err);
					}
				});
			},

			getAll: function(onSuccess, onError) {
				
				//crafting query
				var statement = helpers.knex
					.table(settings.schema.table_name)
					.orderBy(settings.schema.primary_key, 'desc')
					.returning(helpers.safeReturning())
					.toString();

				//executing query
				helpers.query(statement, function(rows) {
					if (onSuccess) {
						return onSuccess(rows);
					}
				}, function(err) {
					if (err && onError) {
						return onError(err);
					}
				});
			},

			getAllWhere: function(where, onSuccess, onError) {
				
				//crafting query
				var statement = helpers.knex
					.table(settings.schema.table_name)
					.where(helpers.whitelist(where))
					.orderBy(settings.schema.primary_key, 'desc')
					.returning(helpers.safeReturning())
					.toString();

				//executing query
				helpers.query(statement, function(rows) {
					if (onSuccess) {
						return onSuccess(rows);
					}
				}, function(err) {
					if (err && onError) {
						return onError(err);
					}
				});
			},

			update: function(id, args, onSuccess, onError) {

				args = helpers.filterTimestamp('_updated', args);

				//crafting query
				var statement = helpers.knex
					.table(settings.schema.table_name)
					.where(settings.schema.primary_key, id)
					.update(args)
					.returning(helpers.safeReturning())
					.toString();
			
				//executing query
				helpers.query(statement, function(rows) {
					if (onSuccess) {
						return onSuccess(rows);
					}
				}, function(err) {
					if (err && onError) {
						return onError(err);
					}
				});
			},

			updateWhere: function(where, args, onSuccess, onError) {

				args = helpers.filterTimestamp('_updated', args);

				//crafting query
				var statement = helpers.knex
					.table(settings.schema.table_name)
					.where(helpers.whitelist(where))
					.update(helpers.whitelist(args))
					.returning(helpers.safeReturning())
					.toString();
				
				//executing query
				helpers.query(statement, function(rows) {
					if (onSuccess) {
						return onSuccess(rows);
					}
				}, function(err) {
					if (err && onError) {
						return onError(err);
					}
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