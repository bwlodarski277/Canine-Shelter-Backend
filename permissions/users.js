'use strict';

/**
 * @file RBAC permissions for /users routes.
 * @module permissions/users
 * @author Bartlomiej Wlodarski
 */

const { AccessControl } = require('role-acl');
const ac = new AccessControl();

const attributes = ['*', '!password'];

// Users can only read their own profiles
ac.grant('user')
	.condition({ Fn: 'EQUALS', args: { user: '$.owner' } })
	.execute('read')
	.on('user', attributes);

// Users can only modify their own profiles
ac.grant('user')
	.condition({ Fn: 'EQUALS', args: { user: '$.owner' } })
	.execute('modify')
	.on('user', attributes);

// Users can only delete their own profiles
ac.grant('user')
	.condition({ Fn: 'EQUALS', args: { user: '$.owner' } })
	.execute('delete')
	.on('user');

// A user can view a favourite
ac.grant('user')
	.condition({ Fn: 'EQUALS', args: { user: '$.owner' } })
	.execute('read')
	.on('favourites');

// A user can add a favourite to themselves
ac.grant('user')
	.condition({ Fn: 'EQUALS', args: { user: '$.owner' } })
	.execute('add')
	.on('favourites');

ac.grant('user')
	.condition({ Fn: 'EQUALS', args: { user: '$.owner' } })
	.execute('delete')
	.on('favourites');

// ac.grant('user').execute('create').on('image');

// Staff have the same permissions as users but can veiw all users
ac.grant('staff').extend('user');
ac.grant('staff').execute('read').on('user', attributes);
ac.grant('staff').execute('read').on('users', attributes);
ac.grant('staff').execute('read').on('favourites');

// Admins can do everything above.
ac.grant('admin').execute('read').on('user');
ac.grant('admin').execute('read').on('users');
ac.grant('admin').execute('modify').on('user');
ac.grant('admin').execute('delete').on('user');
ac.grant('admin').execute('read').on('favourites');
ac.grant('admin').execute('delete').on('favourites');
// ac.grant('admin').execute('create').on('image');

exports.user = {
	/**
	 * Checks if a user may get the data of a given user.
	 * @param {string} role user's role
	 * @param {number} user user's ID
	 * @param {number} owner ID of user being accessed
	 */
	get: async (role, user, owner) =>
		await ac.can(role).context({ user, owner }).execute('read').on('user'),

	/**
	 * Checks if a user may get a list of users.
	 * @param {string} role user's role
	 * @param {number} user user's ID
	 * @param {number} owner ID of user being accessed
	 */
	getAll: async (role, user, owner) =>
		await ac.can(role).context({ user, owner }).execute('read').on('users'),

	/**
	 * Checks if a user may modify a given user.
	 * @param {string} role user's role
	 * @param {number} user user's ID
	 * @param {number} owner ID of user being accessed
	 */
	modify: async (role, user, owner) =>
		await ac.can(role).context({ user, owner }).execute('modify').on('user'),

	/**
	 * Checks if a user may delete a given user.
	 * @param {string} role user's role
	 * @param {number} user user's ID
	 * @param {number} owner ID of user being accessed
	 */
	delete: async (role, user, owner) =>
		await ac.can(role).context({ user, owner }).execute('delete').on('user')
};

exports.favourite = {
	/**
	 * Checks if a user may read a user's favourites.
	 * @param {string} role user's role
	 * @param {number} user user's ID
	 * @param {number} owner ID of user being accessed
	 */
	get: async (role, user, owner) =>
		await ac.can(role).context({ user, owner }).execute('read').on('favourites'),

	/**
	 * Checks if a user may create a user's favourites.
	 * @param {string} role user's role
	 * @param {number} user user's ID
	 * @param {number} owner ID of user being accessed
	 */
	create: async (role, user, owner) =>
		await ac.can(role).context({ user, owner }).execute('add').on('favourites'),

	/**
	 * Checks if a user may delete a user's favourites.
	 * @param {string} role user's role
	 * @param {number} user user's ID
	 * @param {number} owner ID of user being accessed
	 */
	delete: async (role, user, owner) =>
		await ac.can(role).context({ user, owner }).execute('delete').on('favourites')
};

// exports.image = {
// 	/**
// 	 * Checks if a user may upload an image.
// 	 * @param {string} role user's role
// 	 */
// 	create: async role => await ac.can(role).execute('create').on('image')
// };
