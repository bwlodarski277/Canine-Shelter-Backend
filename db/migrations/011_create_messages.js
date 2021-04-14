'use strict';

// eslint-disable-next-line no-unused-vars
const Knex = require('knex');
const { stringFromFile } = require('../../helpers/utils');

/**
 * Creates the messages table.
 * @param {Knex} knex knex object to perform creation
 */
exports.up = knex => {
	return knex.schema.raw(stringFromFile('./sql/messages.sql'));
};

/**
 * Drops the messages table.
 * @param {Knex} knex knex object to perform drop
 */
exports.down = knex => {
	return knex.schema.dropTableIfExists('messages');
};
