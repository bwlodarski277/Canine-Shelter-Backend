'use strict';

// eslint-disable-next-line no-unused-vars
const Knex = require('knex');

const dogs = [
	{ name: 'Rex', description: 'A good boi', age: 5, gender: 1 },
	{ name: 'Woofer', description: 'A woofy boi', age: 3, gender: 1 },
	{ name: 'Luna', description: 'A good grill', age: 2, gender: 0 },
	{ name: 'Doge', description: 'A good boi', age: 10, gender: 1 },
	{ name: 'Maximilian', description: 'A good boi', age: 5, gender: 1 },
	{ name: 'Spot', description: 'A woofy boi', age: 3, gender: 1 },
	{ name: 'Bean', description: 'A good grill', age: 2, gender: 0 },
	{ name: 'Copper', description: 'A good boi', age: 10, gender: 1 },
	{ name: 'Gerald', description: 'A good boi', age: 10, gender: 1 }
];

/**
 * Seeds the dogs table.
 * @param {Knex} knex knex object to seed data
 */
exports.seed = knex => {
	return knex('dogs')
		.delete()
		.then(() => knex('dogs').insert(dogs));
};
