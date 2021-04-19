'use strict';

// eslint-disable-next-line no-unused-vars
const Knex = require('knex');

const chats = [
	{ locationId: 1, userId: 1 }, //1
	{ locationId: 2, userId: 5 }, //2
	{ locationId: 1, userId: 2 }, //3
	{ locationId: 1, userId: 3 }, //4
	{ locationId: 1, userId: 4 }, //5
	{ locationId: 4, userId: 6 }, //6
	{ locationId: 4, userId: 5 } //7
];

/**
 * Seeds the chats table.
 * @param {Knex} knex knex object to seed data
 */
exports.seed = knex => {
	return knex('chats')
		.delete()
		.then(() => knex('chats').insert(chats));
};
