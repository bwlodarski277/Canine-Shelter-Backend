'use strict';

// eslint-disable-next-line no-unused-vars
const Knex = require('knex');
const stringFromFile = require('../stringFromFile');

/**
 * Creates the dogBreeds table.
 * @param {Knex} knex knex object to perform creation
 */
exports.up = knex => {
	return knex.schema.raw(stringFromFile('./sql/dogBreeds.sql'));
};

/**
 * Drops the dogBreeds table.
 * @param {Knex} knex knex object to perform drop
 */
exports.down = knex => {
	return knex.schema.dropTableIfExists('dogBreeds');
};
