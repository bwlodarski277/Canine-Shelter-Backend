'use strict';

// eslint-disable-next-line no-unused-vars
const { AccessControl, Permission } = require('role-acl');

/**
 * @file Permission helper. Used for generating a permission generator.
 * @module helpers/permissions
 * @author Bartlomiej Wlodarski
 */

/**
 * Simple type union.
 * @typedef {(number|string|boolean)} simple
 */

/**
 * Generates a perms generator using an AccessControl object.
 * Used to avoid duplicate code in permissions files.
 * @param {AccessControl} ac AccessControl object from role-acl.
 * @param {string} current context value to check.
 * @param {string} expected expected context value.
 * @returns {function(string, string): function} generatePerms function generator.
 * @see module:helpers/permissions~generatePerms
 * @function
 */
const permGenerator = (ac, current, expected) => {
	/**
	 * Generates an authorizer function.
	 * Used in instances where we only need to check if
	 * a user can modify their own data.
	 * @typedef generatePerms
	 * @type {function}
	 * @param {string} action action to perform on resource.
	 * @param {string} onResource resource to perform action on.
	 * @returns {function(string, simple, simple)} AccessControl perm. checker generator.
	 * @see module:helpers/permissions~checker
	 * @see module:helpers/permissions~simple
	 * @function
	 */
	const generatePerms = (action, onResource) => {
		/**
		 * Checks whether a user may perform an action on a resource.
		 * @typedef checker
		 * @type {function}
		 * @param {string} role role to check.
		 * @param {simple} value data to validate.
		 * @param {simple} toCheck data to validate against.
		 * @returns {Promise<Permission>} AccessControl validator.
		 * @see module:models/users~User
		 * @see module:helpers/permissions~simple
		 * @function
		 * @async
		 */
		const checker = async (role, value, toCheck) =>
			await ac
				.can(role)
				.context({ [current]: value, [expected]: toCheck })
				.execute(action)
				.on(onResource);
		return checker;
	};
	return generatePerms;
};

module.exports = permGenerator;
