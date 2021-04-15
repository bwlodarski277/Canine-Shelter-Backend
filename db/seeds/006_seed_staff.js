'use strict';

// eslint-disable-next-line no-unused-vars
const Knex = require('knex');

const staff = [
	{ userId: 2, locationId: 1 },
	{ userId: 3, locationId: 2 }
];

/**
 * Seeds the staff table.
 * @param {Knex} knex knex object to seed data
 */
exports.seed = knex => {
	return knex('staff')
		.delete()
		.then(() => knex('staff').insert(staff));
};
