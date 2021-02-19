const { db, run } = require('../helpers/database');
const bcrypt = require('bcrypt');

/** List of columns to return from the DB (excludes password). */
const cols = [
    'id', 'username', 'email', 'firstName',
    'lastName', 'dateCreated', 'dateModified', 'imageUrl'];

/**
 * Gets a user entry by their username.
 * Used for authentication only!
 * @param {string} username User's unique username.
 * @returns {Promise<object>} user's record from the DB.
 * @async
 */
exports.findByUsername = async username => {
    const [data] = await run(async () =>
        await db('users').where({ username }));
    return data;
}

/**
 * Gets all users from the DB.
 * @returns {Promise<Array<object>>} list of users in the DB.
 * @async
 */
exports.getAll = async () => {
    const data = await run(async () =>
        await db('users').select(...cols));
    return data;
}

/**
 * Gets a single user from the DB by their ID.
 * @param {number} id ID of user to fetch.
 * @returns {Promise<object>} object containing the user's record.
 * @async
 */
exports.getById = async id => {
    const [data] = await run(async () =>
        await db('users').where({ id }).select(...cols));
    return data;
}

/**
 * Creates a new user entry in the DB.
 * @param {object} user user data to pass to the DB.
 * @returns {Promise<number>} ID of the newly inserted row.
 * @async
 */
exports.add = async user => {
    // Hashing the password and storing it back in the object
    const { password } = user;
    const hash = bcrypt.hashSync(password, 10);
    user.password = hash;
    // Passing data to Knex
    const [data] = await run(async () =>
        await db('users').insert(user));
    return data;
}

/**
 * Updates a user record in the DB.
 * @param {number} id ID of the user to update
 * @param {object} user user data to pass to the DB.
 * @returns {Promise<object>} updated user entry.
 * @async
 */
exports.update = async (id, user) => {
    const [data] = await run(async () =>
        await db('users').where({ id }).update(user));
    return data;
}

/**
 * Deletes a user entry from the DB.
 * @param {number} id ID of user to remove.
 * @returns {Promise<number>} number of affected rows (should be 1).
 * @async
 */
exports.delete = async id => {
    const data = await run(async () =>
        await db('users').where({ id }).delete());
    return data;
}