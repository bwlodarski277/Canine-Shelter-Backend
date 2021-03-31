'use strict';

/**
 * @file Chat messages model to manage interactions with the database.
 * @module models/chatMessages
 * @author Bartlomiej Wlodarski
 */

const { db, run } = require('../helpers/database');

/**
 * Chat message object returned from the DB.
 * @typedef {object} ChatMessage
 * @property {number} chatId Chat ID (foreign key)
 * @property {number} messageId Message ID (foreign key)
 */

/**
 * Gets a list of chat messages by chat ID.
 * @param {int} chatId ID of the chat to lookup.
 * @returns {Promise<Array<ChatMessage>>} List of chat message records.
 * @async
 */
exports.getByChatId = async chatId => {
	const data = await run(async () => await db('chatMessages').where({ chatId }));
	return data;
};

/**
 * Creates a new chat message entry in the DB.
 * @param {number} chatId ID of the chat to add a message to.
 * @param {number} messageId ID of the message to add to a chat.
 * @returns {Promise<number>} ID of newly inserted row.
 * @async
 */
exports.add = async (chatId, messageId) => {
	const [data] = await run(async () => await db('chatMessages').insert({ chatId, messageId }));
	return data;
};

/**
 * Deletes a chat message entry from the DB.
 * @param {number} messageId ID of the chat message to delete.
 * @returns {Promise<number>} number of affected rows (should be 1).
 * @async
 */
exports.delete = async messageId => {
	const data = await run(async () => await db('chatMessages').where({ messageId }).delete());
	return data;
};
