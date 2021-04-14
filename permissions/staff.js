'use strict';

/**
 * @file RBAC permissions for /staff routes.
 * @module permissions/staff
 * @author Bartlomiej Wlodarski
 */

const { AccessControl } = require('role-acl');
const ac = new AccessControl();

const { config } = require('../config');

// Users may attempt to register themselves as staff
ac.grant('user')
	.condition({ Fn: 'EQUALS', args: { key: config.staffKey } })
	.execute('create')
	.on('staff');

// Staff may view all staff
ac.grant('staff').execute('read').on('staff');

//Staff may modify their own record
ac.grant('staff')
	.condition({ Fn: 'EQUALS', args: { user: '$.owner' } })
	.execute('modify')
	.on('staff');

// Admins may perform the same actions but also delete staff.
ac.grant('admin').extend('staff');
ac.grant('admin').execute('modify').on('staff');
ac.grant('admin').execute('delete').on('staff');

/**
 * Checks if a user may register themselves as a staff member.
 * @param {string} role user's role
 * @param {string} key provided staff key
 * @returns permission object
 */
exports.create = async (role, key) =>
	await ac.can(role).context({ key }).execute('create').on('staff');

/**
 * Checks if a user may view staff list.
 * @param {string} role user's role
 * @returns permission object
 */
exports.read = async role => await ac.can(role).execute('read').on('staff');

/**
 * Checks if a user may modify a staff member.
 * @param {string} role user's role
 * @param {number} user user ID
 * @param {number} owner ID of staff member being modified
 * @returns permission object
 */
exports.modify = async (role, user, owner) =>
	await ac.can(role).condition({ user, owner }).execute('modify').on('staff');

/**
 * Checks if a user may delete a staff member.
 * @param {string} role user's role
 * @returns permission object
 */
exports.delete = async role => await ac.can(role).execute('delete').on('staff');
