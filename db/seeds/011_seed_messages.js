'use strict';

// eslint-disable-next-line no-unused-vars
const Knex = require('knex');

const messages = [
	{ sender: 0, message: 'Test message' }, //1
	{ sender: 1, message: 'Another message' }, //2
	{ sender: 0, message: 'Yet another message' }, //3
	{ sender: 1, message: 'The last message' }, //4
	{ sender: 1, message: 'Testing!' }, //5
	{ sender: 1, message: 'asdasdasd' }, //6
	{ sender: 0, message: 'qwertyuiop' }, //7
	{ sender: 0, message: 'zzxczxczxc' } //8
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
