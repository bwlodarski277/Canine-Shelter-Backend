'use strict';

/**
 * @file Users model to manage interactions with the database.
 * @module models/users
 * @author Bartlomiej Wlodarski
 */

const { db, run } = require('../helpers/database');
const bcrypt = require('bcryptjs');

/**
 * User object returned from the DB.
 * @typedef {object} User
 * @property {number} id User ID
 * @property {string} username Unique username
 * @property {string} email User's email address
 * @property {string} password User password (not returned by get calls)
 * @property {string} firstName User's first name
 * @property {string} lastName User's last name
 * @property {string} dateCreated Date when the user was created
 * @property {string} dateModified Last date when user details were changed
 * @property {string} imageUrl Link to user's profile picture
 */

/**
 * Gets a user entry by their username.
 * Used for authentication only!
 * @param {string} username User's unique username.
 * @param {string} [provider='local'] Provider to check (the same username may appear in multiple providers.)
 * @returns {Promise<User>} user's record from the DB.
 * @async
 */
exports.findByUsername = async (username, provider = 'local') => {
	const [data] = await run(async () => await db('users').where({ username, provider }));
	return data;
};

//  * @param {Array<string>} select list of columns to select.
/**
 * Gets all users from the DB.
 * @param {string} query search for users by username.
 * @param {number} page which page to get data from.
 * @param {number} limit number of items on a page.
 * @param {string} order what parameter to order by.
 * @param {'asc'|'desc'} direction direction to sort (asc. or desc.).
 * @returns {Promise<Array<User>>} list of users in the DB.
 * @async
 */
exports.getAll = async (query, page, limit, order, direction) => {
	const offset = (page - 1) * limit;
	const data = await run(
		async () =>
			await db('users')
				// .select(...select)
				.where('username', 'like', `%${query}%`)
				.orderBy(order, direction)
				.limit(limit)
				.offset(offset)
	);
	return data;
};

// * @param {Array<string>} select list of columns to select.
/**
 * Gets a single user from the DB by their ID.
 * @param {number} id ID of user to fetch.
 * @returns {Promise<User>} object containing the user's record.
 * @async
 */
exports.getById = async id => {
	const [data] = await run(async () => await db('users').where({ id }));
	// .select(...select)
	return data;
};

/**
 * Gets a single user from the DB by their username.
 * @param {string} username username of user to fetch.
 * @param {string} provider provider to check for username.
 * @returns {Promise<User>} object containing the user's record.
 * @async
 */
exports.getByUsername = async (username, provider = 'local') => {
	const [data] = await run(async () => await db('users').where({ username, provider }));
	return data;
};

/**
 * Get a single user from the DB by their email address.
 * @param {string} email email address to search by.
 * @returns {Promise<User>} object containing the user's record.
 * @async
 */
exports.getByEmail = async email => {
	const [data] = await run(async () => await db('users').where({ email }));
	return data;
};

/**
 * Creates a new user entry in the DB.
 * @param {User} user user data to pass to the DB.
 * @returns {Promise<number>} ID of the newly inserted row.
 * @async
 */
exports.add = async user => {
	// Hashing the password and storing it back in the object
	const { password } = user;
	// We can't test the else as this only happens during the google callback
	/* istanbul ignore else */
	if (password) {
		const hash = bcrypt.hashSync(password, 10);
		user.password = hash;
	}
	// Passing data to Knex
	const [data] = await run(async () => await db('users').insert(user));
	return data;
};

/**
 * Updates a user record in the DB.
 * @param {number} id ID of the user to update
 * @param {User} user user data to pass to the DB.
 * @returns {Promise<number>} number of updated rows (should be 1).
 * @async
 */
exports.update = async (id, user) => {
	// If the user is changing their password
	if (user.password) {
		const { password } = user;
		const hash = bcrypt.hashSync(password, 10);
		user.password = hash;
	}
	const data = await run(async () => await db('users').where({ id }).update(user));
	return data;
};

/**
 * Deletes a user entry from the DB.
 * @param {number} id ID of user to remove.
 * @returns {Promise<number>} number of affected rows (should be 1).
 * @async
 */
exports.delete = async id => {
	const data = await run(async () => await db('users').where({ id }).delete());
	return data;
};
