'use strict';

// eslint-disable-next-line no-unused-vars
const Knex = require('knex');

const locations = [
	{ name: 'Coventry shelter', address: 'Sample Address, Sample Place, UK' }, //1
	{ name: 'Birmingham Shelter', address: 'Another Address, Another Place' }, //2
	{ name: 'Brighton Shelter', address: 'Another place etc' }, //3
	{ name: 'Another Shelter', address: 'Another place etc' }, //4
	{ name: 'Bournemouth Shelter', address: 'Yet another place' }, //5
	{ name: 'Cambridge Shelter', address: 'Yet another place' } //6
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
