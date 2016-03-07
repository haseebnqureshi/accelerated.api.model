module.exports = function(express, app, models) {

	/*------
	Dependencies
	------------*/

	var _ = require('underscore');
	var pg = require('pg');
	var types = require('pg').types;
	var path = require('path');

	//@see http://knexjs.org for knex query builder documentation
	var knex = require('knex')({ client: 'pg' });

	//loading our table schema
	var schema = require(path.join(__dirname, process.env.DB_CLIENT + '.schema.json'));

	//declare before helpers, so that helpers have access to model
	var Model;

	/*------
	Helpers
	------------*/

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

	var getConnectionString = function() {
		return 'postgres://'
			+ process.env.PG_USER + ':'
			+ process.env.PG_PASSWORD + '@'
			+ process.env.PG_HOST + ':'
			+ (process.env.PG_PORT || 5432).toString() + '/'
			+ process.env.PG_DATABASE;
	};

	/*
	Instead of relying on KnexJS, we're using the native pg drivers to make
	DB connections and return data, while using KnexJS for strictly query
	building.
	*/

	var query = function(statement, onSuccess, onError) {
		pg.connect(getConnectionString(), function(err, client, done) {
			if (err) { throw err; }

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

	var whitelist = function(args, scenario) {

		//loading our specified whitelist array
		var keys = schema.whitelist[scenario];

		//if keys are undefined, try loading default
		if (!keys) {
			keys = schema.whitelist['default'];
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

	var safeReturning = function(scenario) {
		switch (scenario) {
			default:
				return '*';
		}
	};

	/*------
	Defining Model
	------------*/

	Model = {

		_setup: function(onSuccess, onError) {

			console.log('[_setup] Conditionally creating table: "' + schema.table_name + '"');

			//crafting query
			var statement = knex.schema
				.createTableIfNotExists(schema.table_name, function(table) {

					//iterates through columns
					_.each(schema.columns, function(column) {

						console.log('[_setup] Modifying query to create column: "' + column[0] + '" with data type: "' + column[1] + '"');

						//creates column with appropriate type
						table[column[1]](column[0]);
					});
				})
				.toString();

			//executing query
			query(statement, function(rows) {

				console.log('[_setup] Table: "' + schema.table_name + '" is verified to exist');

				if (onSuccess) {
					return onSuccess(rows);
				}
			}, function(err) {

				console.log('[_setup] Failed creating table: "' + schema.table_name + '"');
				console.log('[_setup]', err);

				if (err && onError) {
					return onError(err);
				}
			});
		},

		create: function(args, onSuccess, onError) {

			//crafting query
			var statement = knex
				.table(schema.table_name)
				.insert(whitelist(args))
				.returning(safeReturning())
				.toString();

			//executing query
			query(statement, function(rows) {
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
			var statement = knex
				.table(schema.table_name)
				.where(schema.primary_key, id)
				.delete()
				.toString();

			//executing query
			query(statement, function(rows) {
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
			var statement = knex
				.table(schema.table_name)
				.where(whitelist(where))
				.delete()
				.toString();

			//executing query
			query(statement, function(rows) {
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
			var statement = knex
				.table(schema.table_name)
				.where(schema.primary_key, id)
				.orderBy(schema.primary_key, 'desc')
				.returning(safeReturning())
				.toString();

			//executing query
			query(statement, function(rows) {
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
			var statement = knex
				.table(schema.table_name)
				.orderBy(schema.primary_key, 'desc')
				.returning(safeReturning())
				.toString();

			//executing query
			query(statement, function(rows) {
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
			var statement = knex
				.table(schema.table_name)
				.where(whitelist(where))
				.orderBy(schema.primary_key, 'desc')
				.returning(safeReturning())
				.toString();

			//executing query
			query(statement, function(rows) {
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

			//crafting query
			var statement = knex
				.table(schema.table_name)
				.where(schema.primary_key, id)
				.update(args)
				.returning(safeReturning())
				.toString();
		
			//executing query
			query(statement, function(rows) {
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

			//crafting query
			var statement = knex
				.table(schema.table_name)
				.where(whitelist(where))
				.update(whitelist(args))
				.returning(safeReturning())
				.toString();
			
			//executing query
			query(statement, function(rows) {
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
	Returning Model
	------------*/

	return Model;

};