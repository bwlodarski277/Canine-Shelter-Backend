'use strict';

// eslint-disable-next-line no-unused-vars
const Knex = require('knex');

const favourites = [
	{ userId: 1, dogId: 1 },
	{ userId: 2, dogId: 2 }
];

/**
 * Seeds the favourites table.
 * @param {Knex} knex knex object to seed data
 */
exports.seed = knex => {
	return knex('favourites')
		.delete()
		.then(() => knex('favourites').insert(favourites));
};
