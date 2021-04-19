'use strict';

// eslint-disable-next-line no-unused-vars
const Knex = require('knex');

const dogLocations = [
	{ dogId: 1, locationId: 1 },
	{ dogId: 2, locationId: 3 },
	{ dogId: 5, locationId: 1 },
	{ dogId: 6, locationId: 2 },
	{ dogId: 9, locationId: 1 }
];

/**
 * Seeds the dogLocations table.
 * @param {Knex} knex knex object to seed data
 */
exports.seed = knex => {
	return knex('dogLocations')
		.delete()
		.then(() => knex('dogLocations').insert(dogLocations));
};
