'use strict';

/**
 * @file RBAC permissions for /dogs routes.
 * @module permissions/dogs
 * @author Bartlomiej Wlodarski
 */

const { AccessControl } = require('role-acl');
const ac = new AccessControl();

const permGenerator = require('../helpers/permissions');

// Not used, but created so that the 'user' role is registered.
ac.grant('user').execute('none').on('none');

//#region /dogs, /dogs{id}

// Staff may add dogs
ac.grant('staff').execute('create').on('dogs');

// Staff may modify dogs at their location
ac.grant('staff')
	.condition({ Fn: 'EQUALS', args: { location: '$.owner' } })
	.execute('modify')
	.on('dog');

// Staff may delete dogs at their location
ac.grant('staff')
	.condition({ Fn: 'EQUALS', args: { location: '$.owner' } })
	.execute('delete')
	.on('dog');

// Admins may do all of the above.
ac.grant('admin').execute('create').on('dogs');
ac.grant('admin').execute('modify').on('dog');
ac.grant('admin').execute('delete').on('dog');

//#endregion

//#region /dogs/{id}/breed

// Staff may set the dog breed of dogs at their location.
ac.grant('staff')
	.condition({ Fn: 'EQUALS', args: { location: '$.owner' } })
	.execute('set')
	.on('dogBreed');

// Staff may modify the dog breed of dogs at their location.
ac.grant('staff')
	.condition({ Fn: 'EQUALS', args: { location: '$.owner' } })
	.execute('modify')
	.on('dogBreed');

ac.grant('staff')
	.condition({ Fn: 'EQUALS', args: { location: '$.owner' } })
	.execute('delete')
	.on('dogBreed');

// Admins may do all the above.
ac.grant('admin').execute('set').on('dogBreed');
ac.grant('admin').execute('modify').on('dogBreed');
ac.grant('admin').execute('delete').on('dogBreed');

//#endregion

//#region /dogs/{id}/location

// Staff may set a dog's location (initially).
ac.grant('staff').execute('set').on('dogLocation');

// Staff may modify a dog's location if the dog is currently at their location.
ac.grant('staff')
	.condition({ Fn: 'EQUALS', args: { location: '$.owner' } })
	.execute('modify')
	.on('dogLocation');

// Staff may delete a dog's location if the dog is currently at their location.
ac.grant('staff')
	.condition({ Fn: 'EQUALS', args: { location: '$.owner' } })
	.execute('delete')
	.on('dogLocation');

// Admins may do all the above.
ac.grant('admin').execute('set').on('dogLocation');
ac.grant('admin').execute('modify').on('dogLocation');
ac.grant('admin').execute('delete').on('dogLocation');

//#endregion

// Generating a permission checker generator
const generatePerms = permGenerator(ac, 'location', 'owner');

/** Checker functions for dogs. */
exports.dog = {
	/** Checks if a user may create a dog. */
	create: async role => await ac.can(role).execute('create').on('dogs'),
	/** Checks if a user may modify a dog. */
	modify: generatePerms('modify', 'dog'),
	/** Checks if a user may delete a dog. */
	delete: generatePerms('delete', 'dog')
};

/** Checker functions for dog breeds. */
exports.dogBreed = {
	/** Checks if a user may set a dog's breed. */
	set: async role => await ac.can(role).execute('set').on('dogBreed'),
	/** Checks if a user may modify a dog's breed. */
	modify: generatePerms('modify', 'dogBreed'),
	/** Checks if a user may delete a dog's breed. */
	delete: generatePerms('delete', 'dogBreed')
};

/** Checker functions for dog locations. */
exports.dogLocation = {
	/** Checks if a user may set a dog's location. */
	set: async role => await ac.can(role).execute('set').on('dogLocation'),
	/** Checks if a user may modify a dog's location. */
	modify: generatePerms('modify', 'dogLocation'),
	/** Checks if a user may delete a dog's location. */
	delete: generatePerms('delete', 'dogLocation')
};
