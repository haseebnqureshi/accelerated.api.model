module.exports = function(express, app, models) {

	/*------
	Dependencies
	------------*/

	var _ = require('underscore');
	var r = require('rethinkdb');
	var path = require('path');

	//loading our table schema
	var schema = require(path.join(__dirname, process.env.DB_CLIENT + '.schema.json'));

	//declare before helpers, so that helpers have access to model
	var Model;

	/*------
	Helpers
	------------*/

	/*
	Easy query helper to create our database connection to our one 
	database, without thinking about it. Take the resulting connection
	and .run(connection, callback) in your queries.
	*/

	var query = function(connectionCallback) {
		r.connect({
			host: process.env.RETHINKDB_HOST,
			port: process.env.RETHINKDB_PORT,
			db: process.env.RETHINKDB_DB
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

	/*------
	Defining Model
	------------*/

	Model = {

		_setup: function(onSuccess, onError) {

			console.log('[_setup] Conditionally creating table: "' + schema.table_name + '"');

			//list all tables and see if our table has been created
			query(function(connection) {
				r.tableList()
					.run(connection, function(err, result) {
						var tableExists = _.indexOf(result, schema.table_name) > -1 ? true : false;

						//if table doesn't exist, we create our table using loaded schema options
						if (!tableExists) {

							console.log('[_setup] Table: "' + schema.table_name + '" does not exist');

							r.tableCreate(schema.table_name, {
								primaryKey: schema.primary_key || 'id',
								durability: schema.durability || 'hard'
							})
							.run(connection, function(err, result) {
								if (err) {

									console.log('[_setup] Failed to create table: "' + schema.table_name + '"');

									if (onError) {
										return onError(err);
									}
								}
								if (result.tables_created > 0) {

									console.log('[_setup] Successfully created table: "' + schema.table_name + '"');

									if (onSuccess) {
										return onSuccess(result);
									}
								}
							});
						}
						else {

							console.log('[_setup] Table: "' + schema.table_name + '" is verified to exist');

						}
					});
			});
		},

		create: function(args, onSuccess, onError) {
			query(function(connection) {
				r.table(schema.table_name)
					.insert(whitelist(args), {
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
			query(function(connection) {

				//ensuring filter is run with primary_key and vlue
				var where = {};
				where[schema.primary_key] = id;

				//executing query
				r.table(schema.table_name)
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
			query(function(connection) {
				r.table(schema.table_name)
					.filter(whitelist(where))
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
			query(function(connection) {

				//ensuring filter is run with primary_key and vlue
				var where = {};
				where[schema.primary_key] = id;

				//executing query
				r.table(schema.table_name)
					.filter(where)
					.run(connection, function(err, cursor) {
						if (err && onError) { 
							return onError(err);
						}
						if (onSuccess) {
							cursor.toArray(function(err, rows) {
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
			query(function(connection) {
				r.table(schema.table_name)
					.run(connection, function(err, cursor) {
						if (err && onError) { 
							return onError(err);
						}
						if (onSuccess) {
							cursor.toArray(function(err, rows) {
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
			query(function(connection) {
				r.table(schema.table_name)
					.filter(whitelist(where))
					.run(connection, function(err, cursor) {
						if (err && onError) { 
							return onError(err);
						}
						if (onSuccess) {
							cursor.toArray(function(err, rows) {
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
			query(function(connection) {

				//ensuring filter is run with primary_key and vlue
				var where = {};
				where[schema.primary_key] = id;

				//executing query
				r.table(schema.table_name)
					.filter(where)
					.update(whitelist(args), {
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
			query(function(connection) {
				r.table(schema.table_name)
					.filter(whitelist(where))
					.update(whitelist(args), {
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
	Returning Model
	------------*/

	return Model;

};