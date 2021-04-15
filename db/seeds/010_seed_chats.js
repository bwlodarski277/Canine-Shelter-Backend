'use strict';

// eslint-disable-next-line no-unused-vars
const Knex = require('knex');

const chats = [
	{ locationId: 1, userId: 1 },
	{ locationId: 2, userId: 5 }
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
