'use strict';

/**
 * @file Chats model to manage interactions with the database.
 * @module modules/chats
 * @author Bartlomiej Wlodarski
 */

const { db, run } = require('../helpers/database');

/**
 * Chat object returned from the DB.
 * @typedef {object} Chat
 * @property {number} id Chat ID
 * @property {number} locationId Location ID (foreign key)
 * @property {number} userId User ID (foreign key)
 */

/**
 * Gets all the chats with a location.
 * @param {number} locationId ID of the location.
 * @returns {Promise<Array<Chat>>} list of chats at with a given location.
 * @async
 */
exports.getAll = async locationId => {
	const data = await run(async () => await db('chats').where({ locationId }));
	return data;
};

/**
 * Creates a new chat between a location and user.
 * @param {number} locationId ID of the location being contacted.
 * @param {number} userId ID of the user contacting the location.
 * @returns {Promise<number>} ID of the newly inserted row.
 * @async
 */
exports.add = async (locationId, userId) => {
	const [data] = await run(async () => await db('chats').insert({ locationId, userId }));
	return data;
};

/**
 * Gets a chat record by the chat ID.
 * @param {number} id ID of the chat.
 * @returns {Promise<Chat>} object containing the chat record.
 * @async
 */
exports.getById = async id => {
	const [data] = await run(async () => await db('chats').where({ id }));
	return data;
};

/**
 * Gets a chat where user ID and location ID match in a chat.
 * @param {number} userId ID of a user.
 * @param {number} locationId ID of a location.
 * @returns {Promise<Chat>} object containing the chat record.
 * @async
 */
exports.getMatching = async (userId, locationId) => {
	const [data] = await run(async () => await db('chats').where({ userId, locationId }));
	return data;
};

/**
 * Gets a list of a user's chats by ID.
 * @param {number} userId ID of a user.
 * @returns {Promise<Chat>} object containing the chat record.
 * @async
 */
exports.getByUserId = async userId => {
	const data = await run(async () => await db('chats').where({ userId }));
	return data;
};

/**
 * Deletes a chat entry from the DB.
 * @param {number} id ID of the chat to delete.
 * @returns {Promise<number>} number of affected rows (should be 1).
 * @async
 */
exports.delete = async id => {
	const data = await run(async () => await db('chats').where({ id }).delete());
	return data;
};
