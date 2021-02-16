const { db, run } = require('../helpers/database');
const bcrypt = require('bcrypt');

/**
 * Gets all users from the DB.
 */
exports.getAll = async () => {
    const data = await run(async () => await db('users'));
    return data;
}

/**
 * Gets a single user from the DB by their ID.
 * @param {number} id ID of user to fetch
 */
exports.getById = async id => {
    const [data] = await run(async () =>
        await db('users').where({ id }));
    return data;
}

/**
 * Creates a new user entry in the DB.
 * @param {Object} user user data to pass to the DB
 */
exports.add = async user => {
    // Hashing the password and storing it back in the object
    const password = user.password;
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
 * @param {Object} user user data to pass to the DB
 */
exports.update = async (id, user) => {
    const data = await run(async () =>
        await db('users').where({ id }).update(user));
    return data;
}

/**
 * Deletes a user entry from the DB.
 * @param {number} id ID of user to remove
 */
exports.delete = async id => {
    const data = await run(async () =>
        await db('users').where({ id }).delete());
    return data;
}