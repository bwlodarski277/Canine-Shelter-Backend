'use strict';

/**
 * @file RBAC permissions for /locations routes.
 * @module permissions/locations
 * @author Bartlomiej Wlodarski
 */

const { AccessControl } = require('role-acl');
const ac = new AccessControl();

// const checkMessage = ctx => {
// 	// If is staff check location, else check user ID.
// 	// TODO: check the role in this function? (not sure if this is needed, since we check the sender stuff.)
// 	if (ctx.sender === 0) return ctx.staffLocation === ctx.chatLocation;
// 	return ctx.userId === ctx.chatUser;
// };

// Not used, but created so that the 'user' role is registered.
// ac.grant('user').execute('none').on('none');

// Letting staff modify details about a location, except address.
ac.grant('staff')
	.condition({ Fn: 'EQUALS', args: { location: '$.owner' } })
	.execute('modify')
	.on('location', ['*', '!address']);

// Only admins may create or delete locations
ac.grant('admin').execute('create').on('location');
ac.grant('admin').execute('modify').on('location');
ac.grant('admin').execute('delete').on('location');

// Users may create chats with a location
ac.grant('user').execute('create').on('chat');

ac.grant('user')
	.condition({ Fn: 'EQUALS', args: { userId: '$.chatUser' } })
	.execute('read')
	.on('chat');

// Staff may view a single chat at their location
ac.grant('staff')
	.condition({ Fn: 'EQUALS', args: { staffLocation: '$.chatLocation' } })
	.execute('read')
	.on('chat');

// Staff may view all chats at their location.
ac.grant('staff')
	.condition({ Fn: 'EQUALS', args: { staffLocation: '$.chatLocation' } })
	.execute('read')
	.on('chats');

// Users may create messages in chats they're part of.
ac.grant('user')
	.condition({ Fn: 'EQUALS', args: { userId: '$.chatUser' } })
	.execute('create')
	.on('message');

// Users may create messages in their own chats.
ac.grant('user')
	.condition({ Fn: 'EQUALS', args: { userId: '$.chatUser' } })
	.execute('read')
	.on('message');

ac.grant('user')
	.condition({ Fn: 'EQUALS', args: { userId: '$.chatUser' } })
	.execute('delete')
	.on('message');

// Staff may create messages in chats with their location.
ac.grant('staff')
	.condition({ Fn: 'EQUALS', args: { staffLocation: '$.chatLocation' } })
	.execute('create')
	.on('message');

// Staff may read messages in chats at their location.
ac.grant('staff')
	.condition({ Fn: 'EQUALS', args: { staffLocation: '$.chatLocation' } })
	.execute('read')
	.on('message');

ac.grant('staff')
	.condition({ Fn: 'EQUALS', args: { staffLocation: '$.chatLocation' } })
	.execute('delete')
	.on('message');

exports.location = {
	/**
	 * Checks if a user may create a location
	 * @param {string} role user's role
	 * @returns permission object
	 */
	create: async role => await ac.can(role).execute('create').on('location'),
	/**
	 * Checks if a user may modify a location
	 * @param {string} role user's role
	 * @param {number} location location ID
	 * @param {number} owner staff's location ID
	 * @returns permission object
	 */
	modify: async (role, location, owner) =>
		await ac.can(role).context({ location, owner }).execute('modify').on('location'),
	/**
	 * Checks if a user may delete a location
	 * @param {string} role user's role
	 * @returns permission object
	 */
	delete: async role => await ac.can(role).execute('delete').on('location')
};

exports.chat = {
	/**
	 * Checks if a user may create a chat.
	 * @param {string} role user's role
	 * @returns permission object
	 */
	create: async role => await ac.can(role).execute('create').on('chat'),
	/**
	 * Checks if a user may read all messages in a chat
	 * @param {string} role user's role
	 * @param {number} staffLocation user's staff location (if staff)
	 * @param {number} chatLocation chat location ID (if staff)
	 * @returns permission object
	 */
	readAll: async (role, staffLocation, chatLocation) =>
		await ac.can(role).context({ staffLocation, chatLocation }).execute('read').on('chats'),
	/**
	 * Checks if a user may read a chat.
	 * @param {string} role user's role
	 * @param {number} userId user's ID
	 * @param {number} chatUser ID of user associated with chat
	 * @param {number} staffLocation staff ID (if staff)
	 * @param {number} chatLocation chat location ID (if staff)
	 * @returns permission object
	 */
	read: async (role, userId, chatUser, staffLocation, chatLocation) =>
		await ac
			.can(role)
			.context({ userId, chatUser, staffLocation, chatLocation })
			.execute('read')
			.on('chat')
};

exports.message = {
	/**
	 * Checks if a user may create a chat message.
	 * @param {string} role user's role
	 * @param {number} userId user's ID
	 * @param {number} chatUser ID of user associated with chat
	 * @param {number} staffLocation staff ID (if staff)
	 * @param {number} chatLocation chat location ID (if staff)
	 * @returns permission object
	 */
	create: async (role, userId, chatUser, staffLocation, chatLocation) =>
		await ac
			.can(role)
			.context({ userId, chatUser, staffLocation, chatLocation })
			.execute('create')
			.on('message'),
	/**
	 * Checks if a user may read a chat message.
	 * @param {string} role user's role
	 * @param {number} userId user's ID
	 * @param {number} chatUser ID of user associated with chat
	 * @param {number} staffLocation staff ID (if staff)
	 * @param {number} chatLocation chat location ID (if staff)
	 * @returns permission object
	 */
	read: async (role, userId, chatUser, staffLocation, chatLocation) =>
		await ac
			.can(role)
			.context({ userId, chatUser, staffLocation, chatLocation })
			.execute('read')
			.on('message'),
	/**
	 * Checks if a user may delete a chat message.
	 * @param {string} role user's role
	 * @param {number} userId user's ID
	 * @param {number} chatUser ID of user associated with chat
	 * @param {number} staffLocation staff ID (if staff)
	 * @param {number} chatLocation chat location ID (if staff)
	 * @returns permission object
	 */
	delete: async (role, userId, chatUser, staffLocation, chatLocation) =>
		await ac
			.can(role)
			.context({ userId, chatUser, staffLocation, chatLocation })
			.execute('delete')
			.on('message')
};
