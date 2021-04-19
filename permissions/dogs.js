'use strict';

/**
 * @file RBAC permissions for /dogs routes.
 * @module permissions/dogs
 * @author Bartlomiej Wlodarski
 */

const { AccessControl } = require('role-acl');
const ac = new AccessControl();

/**
 * Checks if the user works at the dog's location
 * or if the dog is not assigned to a location.
 */
const ifOwnerOrNone = context => context.location === context.owner || context.owner === undefined;

// Not used, but created so that the 'user' role is registered.
ac.grant('user').execute('none').on('none');

//#region /dogs, /dogs{id}

// Staff may add dogs
ac.grant('staff').execute('create').on('dog');

// Staff may modify dogs at their location
ac.grant('staff').condition(ifOwnerOrNone).execute('modify').on('dog');

// Staff may delete dogs at their location
ac.grant('staff').condition(ifOwnerOrNone).execute('delete').on('dog');

// Admins may do all of the above.
ac.grant('admin').execute('create').on('dog');
ac.grant('admin').execute('modify').on('dog');
ac.grant('admin').execute('delete').on('dog');

//#endregion

//#region /dogs/{id}/breed

// Staff may set the dog breed of dogs at their location.
ac.grant('staff').execute('set').on('dogBreed');

// Staff may modify the dog breed of dogs at their location.
ac.grant('staff').condition(ifOwnerOrNone).execute('modify').on('dogBreed');

ac.grant('staff').condition(ifOwnerOrNone).execute('delete').on('dogBreed');

// Admins may do all the above.
ac.grant('admin').execute('set').on('dogBreed');
ac.grant('admin').execute('modify').on('dogBreed');
ac.grant('admin').execute('delete').on('dogBreed');

//#endregion

//#region /dogs/{id}/location

// Staff may set a dog's location (initially).
ac.grant('staff').execute('set').on('dogLocation');

// Staff may modify a dog's location if the dog is currently at their location.
ac.grant('staff').condition(ifOwnerOrNone).execute('modify').on('dogLocation');

// Staff may delete a dog's location if the dog is currently at their location.
ac.grant('staff').condition(ifOwnerOrNone).execute('delete').on('dogLocation');

// Admins may do all the above.
ac.grant('admin').execute('set').on('dogLocation');
ac.grant('admin').execute('modify').on('dogLocation');
ac.grant('admin').execute('delete').on('dogLocation');

//#endregion

/** Checker functions for dogs. */
exports.dog = {
	/** Checks if a user may create a dog. */
	create: async role => await ac.can(role).execute('create').on('dog'),

	/** Checks if a user may modify a dog. */
	modify: async (role, userLoc, dogLoc) =>
		await ac
			.can(role)
			.context({ location: userLoc, owner: dogLoc })
			.execute('modify')
			.on('dog'),

	/** Checks if a user may delete a dog. */
	delete: async (role, userLoc, dogLoc) =>
		// Next line causes inconsistency if linted.
		// eslint-disable-next-line prettier/prettier
		await ac.can(role)
			.context({ location: userLoc, owner: dogLoc })
			.execute('modify')
			.on('dog')
};

/** Checker functions for dog breeds. */
exports.dogBreed = {
	/** Checks if a user may set a dog's breed. */
	set: async role => await ac.can(role).execute('set').on('dogBreed'),

	/** Checks if a user may modify a dog's breed. */
	modify: async (role, userLoc, dogLoc) =>
		await ac
			.can(role)
			.context({ location: userLoc, owner: dogLoc })
			.execute('modify')
			.on('dogBreed'),

	/** Checks if a user may delete a dog's breed. */
	delete: async (role, userLoc, dogLoc) =>
		await ac
			.can(role)
			.context({ location: userLoc, owner: dogLoc })
			.execute('delete')
			.on('dogBreed')
};

/** Checker functions for dog locations. */
exports.dogLocation = {
	/** Checks if a user may set a dog's location. */
	set: async role => await ac.can(role).execute('set').on('dogLocation'),

	/** Checks if a user may modify a dog's location. */
	modify: async (role, userLoc, dogLoc) =>
		await ac
			.can(role)
			.context({ location: userLoc, owner: dogLoc })
			.execute('modify')
			.on('dogLocation'),

	/** Checks if a user may delete a dog's location. */
	delete: async (role, userLoc, dogLoc) =>
		await ac
			.can(role)
			.context({ location: userLoc, owner: dogLoc })
			.execute('delete')
			.on('dogLocation')
};
