'use strict';

/**
 * @file RBAC permissions for /users routes.
 * @module permissions/users
 * @author Bartlomiej Wlodarski
 */

const { AccessControl } = require('role-acl');
const ac = new AccessControl();

const permGenerator = require('../helpers/permissions');

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

// A user can read their favourites
ac.grant('user')
	.condition({ Fn: 'EQUALS', args: { user: '$.owner' } })
	.execute('read')
	.on('userFavourites');

// A user can view a favourite of theirs
ac.grant('user')
	.condition({ Fn: 'EQUALS', args: { user: '$.owner' } })
	.execute('read')
	.on('userFavourite');

// A user can add a favourite to themselves
ac.grant('user')
	.condition({ Fn: 'EQUALS', args: { user: '$.owner' } })
	.execute('add')
	.on('userFavourites');

ac.grant('user')
	.condition({ Fn: 'EQUALS', args: { user: '$.owner' } })
	.execute('delete')
	.on('userFavourite');

// Staff have the same permissions as users but can veiw all users
ac.grant('staff').extend('user');
ac.grant('staff').execute('read').on('user', ['*', '!password']);
ac.grant('staff').execute('read').on('users', ['*', '!password']);
ac.grant('staff').execute('read').on('userFavourite');
ac.grant('staff').execute('read').on('userFavourites');

// Admins can do everything above.
ac.grant('admin').execute('read').on('user');
ac.grant('staff').execute('read').on('users');
ac.grant('admin').execute('modify').on('user');
ac.grant('admin').execute('delete').on('user');
ac.grant('admin').execute('read').on('userFavourite');
ac.grant('admin').execute('read').on('userFavourites');
ac.grant('admin').execute('delete').on('userFavourite');

// /**
//  * Generates an authorizer function.
//  * Used in instances where we only need to check if
//  * a user can modify their own data.
//  * @param {string} action action to perform on resource.
//  * @param {string} onResource resource to perform action on.
//  * @returns {Checker} permission checker function.
//  * @see module:permissions/users~Checker
//  * @function
//  */
// const generatePerms = (action, onResource) => {
// 	/**
// 	 * Checks whether a user may perform an action on a resource.
// 	 * @typedef Checker
// 	 * @type {function}
// 	 * @param {module:models/users~User} user user to authorize.
// 	 * @param {object} data data to validate against.
// 	 * @see module:models/users~User
// 	 * @function
// 	 */
// 	const checker = async (user, data) =>
// 		await ac
// 			.can(user.role)
// 			.context({ user: user.id, owner: data.id })
// 			.execute(action)
// 			.on(onResource);
// 	return checker;
// };

const generatePerms = permGenerator(ac, 'user', 'owner');

/**
 * Checks if a user may get the data of a given user.
 */
exports.get = generatePerms('read', 'user');

/**
 * Checks if a user may get a list of users.
 */
exports.getAll = generatePerms('read', 'users');

/**
 * Checks if a user may modify a given user.
 */
exports.modify = generatePerms('modify', 'user');

/**
 * Checks if a user may delete a given user.
 */
exports.delete = generatePerms('delete', 'user');
