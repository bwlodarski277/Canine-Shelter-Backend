'use strict';

// eslint-disable-next-line no-unused-vars
const Knex = require('knex');

const chatMessages = [
	{ chatId: 1, messageId: 1 },
	{ chatId: 1, messageId: 2 },
	{ chatId: 2, messageId: 3 },
	{ chatId: 2, messageId: 4 },
	{ chatId: 7, messageId: 5 },
	{ chatId: 7, messageId: 6 },
	{ chatId: 7, messageId: 7 },
	{ chatId: 7, messageId: 8 }
];

/**
 * Seeds the chatMessages table.
 * @param {Knex} knex knex object to seed data
 */
exports.seed = knex => {
	return knex('chatMessages')
		.delete()
		.then(() => knex('chatMessages').insert(chatMessages));
};
