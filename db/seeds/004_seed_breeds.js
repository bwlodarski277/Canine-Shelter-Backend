'use strict';

// eslint-disable-next-line no-unused-vars
const Knex = require('knex');

const breeds = [
	{ name: 'Golden Retriever', description: 'Hairy, golden breed' },
	{ name: 'Samoyed', description: 'Very floofy white breed' },
	{ name: 'Shiba Inu', description: 'Smol fox-like breed' }
];

/**
 * Seeds the breeds table.
 * @param {Knex} knex knex object to seed data
 */
exports.seed = knex => {
	return knex('breeds')
		.delete()
		.then(() => knex('breeds').insert(breeds));
};
