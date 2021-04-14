'use strict';

const { config } = require('./config');
require('dotenv').config();

module.exports = {
	development: {
		client: 'mysql2',
		connection: {
			host: config.host,
			port: config.port,
			user: config.user,
			password: config.password,
			database: config.database
		},
		migrations: { directory: __dirname + '/db/migrations' },
		seeds: { directory: __dirname + '/db/seeds' }
	},
	test: {
		client: 'mysql2',
		connection: {
			host: config.host,
			port: config.port,
			user: config.user,
			password: config.password,
			database: config.testDatabase
		},
		migrations: { directory: __dirname + '/db/migrations' },
		seeds: { directory: __dirname + '/db/seeds' }
	}
};
