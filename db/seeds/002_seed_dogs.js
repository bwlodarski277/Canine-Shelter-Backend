'use strict';

// eslint-disable-next-line no-unused-vars
const Knex = require('knex');

const dogs = [
	{ name: 'Rex', description: 'A good boi', age: 5, gender: 1, imageUrl: 'sampleUrl' },
	{ name: 'Woofer', description: 'A woofy boi', age: 3, gender: 1, imageUrl: 'sampleUrl' },
	{ name: 'Luna', description: 'A good grill', age: 2, gender: 0, imageUrl: 'sampleUrl' },
	{ name: 'Doge', description: 'A good boi', age: 10, gender: 1, imageUrl: 'sampleUrl' },
	{ name: 'Rex2', description: 'A good boi', age: 5, gender: 1, imageUrl: 'sampleUrl' },
	{ name: 'Woofer2', description: 'A woofy boi', age: 3, gender: 1, imageUrl: 'sampleUrl' },
	{ name: 'Luna2', description: 'A good grill', age: 2, gender: 0, imageUrl: 'sampleUrl' },
	{ name: 'Doge2', description: 'A good boi', age: 10, gender: 1, imageUrl: 'sampleUrl' },
	{ name: 'Doge3', description: 'A good boi', age: 10, gender: 1, imageUrl: 'sampleUrl' }
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
