'use strict';

// eslint-disable-next-line no-unused-vars
const Knex = require('knex');

const dogBreeds = [
	{ dogId: 1, breedId: 1 },
	{ dogId: 2, breedId: 2 },
	{ dogId: 3, breedId: 3 },
	{ dogId: 4, breedId: 1 },
	{ dogId: 5, breedId: 2 },
	{ dogId: 6, breedId: 3 },
	{ dogId: 7, breedId: 1 },
	{ dogId: 8, breedId: 2 },
	{ dogId: 9, breedId: 3 }
];

/**
 * Seeds the dogBreeds table.
 * @param {Knex} knex knex object to seed data
 */
exports.seed = knex => {
	return knex('dogBreeds')
		.delete()
		.then(() => knex('dogBreeds').insert(dogBreeds));
};
