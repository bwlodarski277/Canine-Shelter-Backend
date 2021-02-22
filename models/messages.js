/**
 * @file Messages model to manage interactions with the database.
 * @module models/messages
 * @author Bartlomiej Wlodarski
 */

const { db, run } = require('../helpers/database');

/**
 * Message object returned from the DB.
 * @typedef {object} Message
 * @property {number} id Message ID
 * @property {boolean} sender Sender identifier (0 for staff, 1 for user)
 * @property {string} dateCreated Date when the message was created
 * @property {string} message Message body
 */

/**
 * Creates a new message entry in the DB.
 * @param {Message} message mesage data to pass to the DB.
 * @returns {Promise<number>} ID of newly inserted row.
 * @async
 */
exports.add = async message => {
    const [data] = await run(async () =>
        db('messages').insert(message));
    return data;
}

/**
 * Gets a single message entry from the DB by its ID.
 * @param {number} id ID of the message to fetch.
 * @returns {Promise<Message>} object containing the message record.
 * @async
 */
exports.getById = async id => {
    const [data] = await run(async () =>
        db('messages').where({ id }));
    return data;
}

/**
 * Deletes a message entry from the DB.
 * @param {number} id ID of the message to delete.
 * @returns {Promise<number>} number of affected rows (should be 1).
 * @async
 */
exports.delete = async id => {
    const data = await run(async () =>
        db('messages').where({ id }).delete());
    return data;
}