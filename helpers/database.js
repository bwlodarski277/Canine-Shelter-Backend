'use strict';

/**
 * @file Database helpers. Used for running queries to the DB.
 * @module helpers/database
 * @author Bartlomiej Wlodarski
 */

const knex = require('knex');
// const { config } = require('../config');
const knexfile = require('../knexfile');

require('dotenv').config();

const knexConfig = knexfile[process.env.NODE_ENV];

/**
 * Knex database object. Used for interacting with the DB.
 */
exports.db = knex(knexConfig);

/**
 * Wrapper for DB queries.
 * Handles errors to make sure sensitive info doesn't leak.
 * @param {function} dbQuery query function to execute
 * @returns {object|Array<object>} data returned from `dbQuery`
 * @throws {DatabaseException} when a database exceptiono occurs.
 * @see module:helpers/database.db
 * @example
 * // Importing the run function and db class
 * const { db, run } = require('./helpers/database');
 * // Using db class to get all dogs
 * const users = await run(async () => await db('dogs'));
 */
exports.run = async dbQuery => {
	try {
		const data = await dbQuery();
		return data;
	} catch (err) {
		console.error(err);
		throw new DatabaseException('A database error has occurred', err.code, err.errno);
	}
};

/**
 * Database Exception class.
 * Used to hide sensitive information when an error happens in the DB.
 * @memberof helpers/database
 */
exports.DatabaseException = class DatabaseException {
	/**
	 * @param {string} message error message to provide
	 * @param {number|string} code exception's error code
	 */
	constructor(message, code, errno) {
		this.message = message;
		this.code = code;
		this.errno = errno;
		this.name = 'DatabaseException';
	}
};
