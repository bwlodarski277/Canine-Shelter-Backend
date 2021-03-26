/**
 * @file Users model to manage interactions with the database.
 * @module models/users
 * @author Bartlomiej Wlodarski
 */

const { db, run } = require('../helpers/database');
const bcrypt = require('bcrypt');

/** List of columns to return from the DB (excludes password). */
const cols = [
	'id',
	'username',
	'email',
	'firstName',
	'lastName',
	'dateCreated',
	'dateModified',
	'imageUrl'
];

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
 * @returns {Promise<User>} user's record from the DB.
 * @async
 */
exports.findByUsername = async username => {
	const [data] = await run(async () => await db('users').where({ username }));
	return data;
};

/**
 * Gets all users from the DB.
 * @returns {Promise<Array<User>>} list of users in the DB.
 * @async
 */
exports.getAll = async () => {
	const data = await run(
		async () =>
			// ...cols is to make sure password is not returned.
			await db('users').select(...cols)
	);
	return data;
};

/**
 * Gets a single user from the DB by their ID.
 * @param {number} id ID of user to fetch.
 * @returns {Promise<User>} object containing the user's record.
 * @async
 */
exports.getById = async id => {
	const [data] = await run(
		async () =>
			await db('users')
				.where({ id })
				.select(...cols)
	);
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
	const hash = bcrypt.hashSync(password, 10);
	user.password = hash;
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
	const data = await run(
		async () => await db('users').where({ id }).update(user)
	);
	return data;
};

/**
 * Deletes a user entry from the DB.
 * @param {number} id ID of user to remove.
 * @returns {Promise<number>} number of affected rows (should be 1).
 * @async
 */
exports.delete = async id => {
	const data = await run(
		async () => await db('users').where({ id }).delete()
	);
	return data;
};
