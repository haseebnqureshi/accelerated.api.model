module.exports = function(express, app, models) {

	/*------
	Dependencies
	------------*/

	var _ = require('underscore');
	var pg = require('pg');

	//@see http://knexjs.org for knex query builder documentation
	var knex = require('knex')({ client: 'pg' });

	//declare before helpers, so that helpers have access to model
	var Model;

	/*------
	Helpers
	------------*/

	/*
	Instead of relying on KnexJS, we're using the native pg drivers to make
	DB connections and return data, while using KnexJS for strictly query
	building.
	*/

	var query = function(statement, onSuccess, onError) {
		pg.connect(process.env.DB_CONNECTION_STRING, function(err, client, done) {
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

		//getting an array of column names
		var columns = _.map(Model._tableColumns, function(value) {
			return value[1];
		});

		//returning appropriate modified args
		switch (scenario) {
			default:
				return _.pick(args, function(value, key) {

					//allow arg to come through, if key matches a column name
					return (_.indexOf(columns, key) > -1);
				});	
		}
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

		/*	
		Modify the folowing _tableName, _tableColumns, and _tablePrimaryIndex
		so standard CRUD operations will operate as expected, according to 
		your database table.
		*/

		_tableName: 'test',

		_tableColumns: [

			/*
			First array value represents data type
			Second array value represents column name
			*/

			[ 'bigIncrements', 'test_id' ],
			[ 'string', 'test_email' ],
			[ 'string', 'test_password' ],
			[ 'string', 'test_firstname' ],
			[ 'string', 'test_lastname' ]
		],

		//used for general select queries
		_tablePrimaryIndex: 'test_id',

		_setup: function() {
			var that = this;
			knex.schema.createTable(this._tableName, function(table) {

				//iterates through columns, creates column with appropriate type
				_.each(that._tableColumns, function(column) {
					table[column[0]](column[1]);
				});
			});
		},

		create: function(args, onSuccess, onError) {

			//crafting query
			var statement = knex
				.table(this._tableName)
				.insert(whitelist(args))
				.returning(safeReturning())
				.toString();

			//executing query
			query(statement, function(rows) {
				if (onSuccess) {
					return onSuccess(rows);
				}
			})
			.catch(function(err) {
				if (err && onError) {
					return onError(err);
				}
			});
		},

		delete: function(id, onSuccess, onError) {

			//crafting query
			var statement = knex
				.table(this._tableName)
				.where(this._tablePrimaryIndex, id)
				.delete()
				.toString();

			//executing query
			query(statement, function(rows) {
				if (onSuccess) {
					return onSuccess();
				}
			})
			.catch(function(err) {
				if (err && onError) {
					return onError(err);
				}
			});
		},

		deleteWhere: function(where, onSuccess, onError) {
			
			//crafting query
			var statement = knex
				.table(this._tableName)
				.where(whitelist(where))
				.delete()
				.toString();

			//executing query
			query(statement, function(rows) {
				if (onSuccess) {
					return onSuccess();
				}
			})
			.catch(function(err) {
				if (err && onError) {
					return onError(err);
				}
			});
		},

		get: function(id, onSuccess, onError) {
			
			//crafting query
			var statement = knex
				.table(this._tableName)
				.where(this._tablePrimaryIndex, id)
				.returning(safeReturning())
				.toString();

			//executing query
			query(statement, function(rows) {
				if (onSuccess) {
					return onSuccess(rows);
				}
			})
			.catch(function(err) {
				if (err && onError) {
					return onError(err);
				}
			});
		},

		getAll: function(onSuccess, onError) {
			
			//crafting query
			var statement = knex
				.table(this._tableName)
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
				.table(this._tableName)
				.where(whitelist(where))
				.returning(safeReturning())
				.toString();

			//executing query
			query(statement, function(rows) {
				if (onSuccess) {
					return onSuccess(rows);
				}
			})
			.catch(function(err) {
				if (err && onError) {
					return onError(err);
				}
			});
		},

		update: function(id, args, onSuccess, onError) {

			//crafting query
			var statement = knex
				.table(this._tableName)
				.where(this._tablePrimaryIndex, id)
				.update(args)
				.returning(safeReturning())
				.toString();
		
			//executing query
			query(statement, function(rows) {
				if (onSuccess) {
					return onSuccess(rows);
				}
			})
			.catch(function(err) {
				if (err && onError) {
					return onError(err);
				}
			});
		},

		updateWhere: function(where, args, onSuccess, onError) {

			//crafting query
			var statement = knex
				.table(this._tableName)
				.where(whitelist(where))
				.update(whitelist(args))
				.returning(safeReturning())
				.toString();
			
			//executing query
			query(statement, function(rows) {
				if (onSuccess) {
					return onSuccess(rows);
				}
			})
			.catch(function(err) {
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