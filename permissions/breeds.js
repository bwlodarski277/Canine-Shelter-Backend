'use strict';

/**
 * @file RBAC permissions for /breeds routes.
 * @module permissions/breeds
 * @author Bartlomiej Wlodarski
 */

const { AccessControl } = require('role-acl');
const ac = new AccessControl();

// Not used, but created so the 'user' role is registered.
ac.grant('user').execute('none').on('none');

// Staff may add, modify or delete breeds
ac.grant('staff').execute('create').on('breed');
ac.grant('staff').execute('modify').on('breed');
ac.grant('staff').execute('delete').on('breed');

// Admins may do the same.
ac.grant('admin').extend('staff');

/** Checks if a user may create a breed. */
exports.create = async role => ac.can(role).execute('create').on('breed');

/** Checks if a user may modify a breed. */
exports.modify = async role => ac.can(role).execute('modify').on('breed');

/** Checks if a user may delete a breed. */
exports.delete = async role => ac.can(role).execute('delete').on('breed');
