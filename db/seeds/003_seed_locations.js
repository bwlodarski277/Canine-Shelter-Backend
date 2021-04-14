'use strict';

// eslint-disable-next-line no-unused-vars
const Knex = require('knex');

const locations = [
	{ name: 'Coventry shelter', address: 'Sample Address, Sample Place, UK' },
	{ name: 'Birmingham Shelter', address: 'Another Address, Another Place' },
	{ name: 'Brighton Shelter', address: 'Another place etc' }
];

/**
 * Seeds the locations table.
 * @param {Knex} knex knex object to seed data
 */
exports.seed = knex => {
	return knex('locations')
		.delete()
		.then(() => knex('locations').insert(locations));
};
