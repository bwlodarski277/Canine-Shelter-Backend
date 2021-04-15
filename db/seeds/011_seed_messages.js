'use strict';

// eslint-disable-next-line no-unused-vars
const Knex = require('knex');

const messages = [
	{ sender: 0, message: 'Test message' },
	{ sender: 1, message: 'Another message' },
	{ sender: 0, message: 'Yet another message' },
	{ sender: 1, message: 'The last message' }
];

/**
 * Seeds the messages table.
 * @param {Knex} knex knex object to seed data
 */
exports.seed = knex => {
	return knex('messages')
		.delete()
		.then(() => knex('messages').insert(messages));
};
