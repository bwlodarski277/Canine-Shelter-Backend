const knex = require('knex');
const { config } = require('../config');

/**
 * Knex database object. Used for interacting with the DB.
 */
exports.db = knex({
    client: 'mysql',
    connection: {
        host: config.host,
        port: config.port,
        user: config.user,
        password: config.password,
        database: config.database
    }
});

/**
 * Wrapper for DB queries.
 * Handles errors to make sure sensitive info doesn't leak.
 * @param {Object} dbQuery query function to execute
 */
exports.run = async dbQuery => {
    try {
        const data = await dbQuery();
        return data;
    } catch (err) {
        console.error(err);
        throw new DatabaseException("Database error", err.code);
    }
};


function DatabaseException(message, code) {
    this.message = message;
    this.code = code;
    this.name = "DatabaseException";
}