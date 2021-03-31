'use strict';

/**
 * @file RBAC permissions for /users routes.
 * @module permissions/users
 * @author Bartlomiej Wlodarski
 */

const { AccessControl } = require('role-acl');
const ac = new AccessControl();

// Users can only read their own profiles
ac.grant('user')
	.condition({ Fn: 'EQUALS', args: { user: '$.owner' } })
	.execute('read')
	.on('user', ['*', '!password']);

// Users can only modify their own profiles
ac.grant('user')
	.condition({ Fn: 'EQUALS', args: { user: '$.owner' } })
	.execute('modify')
	.on('user', ['*', '!password']);

// Users can only delete their own profiles
ac.grant('user')
	.condition({ Fn: 'EQUALS', args: { user: '$.owner' } })
	.execute('delete')
	.on('user');

// Staff have the same permissions as users but can veiw all users
ac.grant('staff').extend('user');
ac.grant('staff').execute('read').on('user', ['*', '!password']);
ac.grant('staff').execute('read').on('users', ['*', '!password']);

// Admins can do everything above.
ac.grant('admin').execute('read').on('user');
ac.grant('admin').execute('modify').on('user');
ac.grant('admin').execute('delete').on('user');
ac.grant('staff').execute('read').on('users');

/**
 * Generates an authorizer function.
 * Used in instances where we only need to check if
 * a user can modify their own data.
 * @param {string} action action to perform on resource.
 * @param {string} onResource resource to perform action on.
 * @returns {Checker} permission checker function.
 * @see module:permissions/users~Checker
 */
const generatePerms = (action, onResource) => {
	/**
	 * Checks whether a user may perform an action on a resource.
	 * @typedef Checker
	 * @type {function}
	 * @param {module:models/users~User} user user to authorize.
	 * @param {object} data data to validate against.
	 * @see module:models/users~User
	 */
	const checker = async (user, data) =>
		await ac
			.can(user.role)
			.context({ user: user.id, owner: data.id })
			.execute(action)
			.on(onResource);
	return checker;
};

/**
 * Checks if a user may get the data of a given user.
 */
exports.get = generatePerms('read', 'user');
exports.getAll = async user => await ac.can(user.role).execute('read').on('users');

exports.modify = async (user, data) =>
	await ac.can(user.role).context({ user: user.id, owner: data.id }).execute('modify').on('user');

exports.modify = async (user, data) =>
	await ac.can(user.role).context({ user: user.id, owner: data.id }).execute('modify').on('user');
