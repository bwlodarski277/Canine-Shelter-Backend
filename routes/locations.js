'use strict';

/**
 * @file Locations route endpoints.
 * @module routes/locations
 * @author Bartlomiej Wlodarski
 */

const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');

const locationsModel = require('../models/locations');
const dogLocationsModel = require('../models/dogLocations');
const chatModel = require('../models/chats');
const chatMessagesModel = require('../models/chatMessages');
const messagesModel = require('../models/messages');
// const userModel = require('../models/users');
const staffModel = require('../models/staff');

const { validateLocation, validateLocationUpdate } = require('../controllers/validation');

const { auth } = require('../controllers/auth');
const { clamp } = require('../helpers/utils');
const { ifModifiedSince, ifNoneMatch } = require('../helpers/caching');

const can = require('../permissions/locations');

const prefix = '/api/v1/locations';
const router = new Router({ prefix });

router.use(bodyParser());

/**
 * Gets all the locations from the database.
 * @param {object} ctx context passed from Koa.
 */
const getAll = async (ctx, next) => {
	let {
		query = '',
		select = [],
		page = 1,
		limit = 10,
		order = 'id',
		direction
	} = ctx.request.query;
	limit = clamp(limit, 1, 20); // Clamping the limit to be between 1 and 20.
	direction = direction === 'desc' ? 'desc' : 'asc';
	if (!Array.isArray(select)) select = Array(select);
	let locations = await locationsModel.getAll(query, page, limit, order, direction);
	locations = locations.map(location => {
		const partial = { id: location.id };
		select.map(field => (partial[field] = location[field]));
		const self = `${ctx.protocol}://${ctx.host}${prefix}/${partial.id}`;
		partial.links = {
			self: self,
			dogs: `${self}/dogs`,
			chats: `${self}/chats`
		};
		return partial;
	});
	ctx.body = locations;
	return next();
};

/**
 * Gets a single location from the database by ID.
 * @param {object} ctx context passed from Koa.
 */
const getLocation = async (ctx, next) => {
	const id = ctx.params.id;
	let { select = [] } = ctx.request.query;
	if (!Array.isArray(select)) select = Array(select);
	const location = await locationsModel.getById(id);
	if (location) {
		let partial;
		// If nothing is selected, return everything
		if (select.length === 0) partial = location;
		else {
			partial = { id: location.id };
			select.map(field => (partial[field] = location[field]));
		}
		select.map(field => (partial[field] = location[field]));
		const self = `${ctx.protocol}://${ctx.host}${prefix}/${partial.id}`;
		partial.links = {
			self: self,
			dogs: `${self}/dogs`,
			chats: `${self}/chats`
		};
		ctx.body = partial;
		return next();
	}
	ctx.status = 404;
	ctx.body = { message: 'Location does not exist.' };
};

/**
 * Adds a location to the database.
 * @param {object} ctx context passed from Koa.
 */
const addLocation = async ctx => {
	const body = ctx.request.body;
	const { role } = ctx.state.user;
	const permission = await can.location.create(role);
	if (!permission.granted) {
		ctx.status = 403;
		return;
	}
	const id = await locationsModel.add(body);
	ctx.status = 201;
	ctx.body = {
		id,
		created: true,
		link: `${ctx.protocol}://${ctx.host}${ctx.request.path}/${id}`
	};
};

/**
 * Updates a location in the database by ID.
 * @param {object} ctx context passed from Koa.
 */
const updateLocation = async ctx => {
	const locationId = parseInt(ctx.params.id);
	const location = await locationsModel.getById(locationId);
	if (location) {
		const { id: userId, role } = ctx.state.user;
		const { locationId: userLoc } = (await staffModel.getByUserId(userId)) || {};
		const permission = await can.location.modify(role, userLoc, locationId);
		if (!permission.granted) {
			ctx.status = 403;
			return;
		}
		// Excluding fields that must not be updated
		const body = permission.filter(ctx.request.body);
		await locationsModel.update(locationId, body);
		ctx.body = {
			id: locationId,
			updated: true,
			link: `${ctx.protocol}://${ctx.host}${ctx.request.path}`
		};
		return;
	}
	ctx.status = 404;
	ctx.body = { message: 'Location does not exist.' };
};

/**
 * Deletes a location from the database by ID.
 * @param {object} ctx context passed from Koa.
 */
const deleteLocation = async ctx => {
	const locationId = parseInt(ctx.params.id);
	const location = await locationsModel.getById(locationId);
	if (location) {
		const { role } = ctx.state.user;
		const permission = await can.location.delete(role);
		if (!permission.granted) {
			ctx.status = 403;
			return;
		}
		await locationsModel.delete(locationId);
		ctx.body = { id: locationId, deleted: true };
		return;
	}
	ctx.status = 404;
	ctx.body = { message: 'Location does not exist.' };
};

/**
 * Gets all the dogs at a location by ID.
 * @param {object} ctx context passed from Koa.
 */
const getLocationDogs = async (ctx, next) => {
	const locationId = ctx.params.id;
	const location = await locationsModel.getById(locationId);
	if (location) {
		let locationDogs = await dogLocationsModel.getByLocationId(locationId);
		locationDogs = locationDogs.map(dog => {
			dog.links = {
				dog: `${ctx.protocol}://${ctx.host}/dogs/${dog.id}`
			};
		});
		ctx.body = locationDogs;
		return next();
	}
	ctx.status = 404;
	ctx.body = { message: 'Location does not exist.' };
};

/**
 * Gets all chats at a location by ID.
 * @param {object} ctx context passed from Koa.
 */
const getAllChats = async (ctx, next) => {
	const locationId = parseInt(ctx.params.id);
	const { id: userId, role } = ctx.state.user;
	const { locationId: staffLoc } = (await staffModel.getByUserId(userId)) || {};
	const location = await locationsModel.getById(locationId);
	if (location) {
		const permission = await can.chat.readAll(role, staffLoc, locationId);
		if (!permission.granted) {
			ctx.status = 403;
			return;
		}
		let chats = await chatModel.getAll(locationId);
		chats = chats.map(chat => {
			const self = `${ctx.protocol}://${ctx.host}${prefix}/${locationId}/chats/${chat.id}`;
			chat.links = {
				self: self,
				messages: `${self}/messages`,
				user: `${ctx.protocol}://${ctx.host}/api/v1/users/${chat.userId}`
			};
			return chat;
		});
		ctx.body = chats;
		return next();
	}
	ctx.status = 404;
	ctx.body = { message: 'Location does not exist.' };
};

const createChat = async ctx => {
	const locationId = parseInt(ctx.params.id);
	const { id: userId, role } = ctx.state.user;
	const permission = await can.chat.create(role);
	if (!permission.granted) {
		ctx.status = 403;
		return;
	}
	const location = await locationsModel.getById(locationId);
	if (location) {
		const chat = await chatModel.getMatching(userId, locationId);
		if (chat) {
			ctx.status = 400;
			ctx.body = { message: 'Chat between user and location exists' };
			return;
		}
		const id = await chatModel.add(locationId, userId);
		ctx.status = 201;
		ctx.body = {
			id,
			created: true,
			link: `${ctx.protocol}://${ctx.host}${ctx.request.path}/${id}`
		};
		return;
	}
	ctx.status = 404;
	ctx.body = { message: 'Location does not exist.' };
};

const deleteChat = async ctx => {
	const locationId = parseInt(ctx.params.id);
	const chatId = parseInt(ctx.params.chatId);
	const { id: userId, role } = ctx.state.user;
	const { locationId: staffLoc } = (await staffModel.getByUserId(userId)) || {};
	const location = await locationsModel.getById(locationId);
	if (location) {
		const chat = await chatModel.getById(chatId);
		if (chat) {
			const { userId: chatUser, locationId: chatLoc } = chat;
			const permission = await can.chat.delete(role, userId, chatUser, staffLoc, chatLoc);
			if (!permission.granted) {
				ctx.status = 403;
				return;
			}
			const messages = await chatMessagesModel.getByChatId(chatId);
			for (const message of messages) await messagesModel.delete(message.id);
			await chatModel.delete(chatId);
			ctx.body = { id: chatId, deleted: true };
			return;
		}
		ctx.status = 404;
		ctx.body = { message: 'Chat does not exist.' };
		return;
	}
	ctx.status = 404;
	ctx.body = { message: 'Location does not exist.' };
};

const getChat = async (ctx, next) => {
	let { id: locationId, chatId } = ctx.params;
	locationId = parseInt(locationId);
	chatId = parseInt(chatId);
	const { id: userId, role } = ctx.state.user;
	// Making sure staffLoc doesn't throw an error if nothing returned
	const { locationId: staffLoc } = (await staffModel.getByUserId(userId)) || {};
	const location = await locationsModel.getById(locationId);
	if (location) {
		const chat = await chatModel.getById(chatId);
		if (chat) {
			const { userId: chatUser } = chat;
			const permission = await can.chat.read(role, userId, chatUser, staffLoc, locationId);
			if (!permission.granted) {
				ctx.status = 403;
				return;
			}
			const self = `${ctx.protocol}://${ctx.host}${prefix}/${locationId}/chats/${chat.id}`;
			chat.links = {
				self: self,
				messages: `${self}/messages`,
				user: `${ctx.protocol}://${ctx.host}/api/v1/users/${chat.userId}`
			};
			ctx.body = chat;
			return next();
		}
		ctx.status = 404;
		ctx.body = { message: 'Chat does not exist.' };
		return;
	}
	ctx.status = 404;
	ctx.body = { message: 'Location does not exist.' };
};

const getMessages = async (ctx, next) => {
	let { id: locationId, chatId } = ctx.params;
	locationId = parseInt(locationId);
	chatId = parseInt(chatId);
	const { id: userId, role } = ctx.state.user;
	// Making sure staffLoc doesn't throw an error if nothing returned
	const { locationId: staffLoc } = (await staffModel.getByUserId(userId)) || {};
	const location = await locationsModel.getById(locationId);
	if (location) {
		const chat = await chatModel.getById(chatId);
		if (chat) {
			const { userId: chatUser } = chat;
			const permission = await can.message.read(role, userId, chatUser, staffLoc, locationId);
			if (!permission.granted) {
				ctx.status = 403;
				return;
			}
			let chatMessages = await chatMessagesModel.getByChatId(chatId);
			chatMessages = chatMessages.map(chatMsg => {
				const selfPrefix = `${ctx.protocol}://${ctx.host}${prefix}`;
				chatMsg.links = {
					self: `${selfPrefix}/${locationId}/chats/${chat.id}/messages/${chatMsg.messageId}`
				};
				return chatMsg;
			});
			ctx.body = chatMessages;
			return next();
		}
		ctx.status = 404;
		ctx.body = { message: 'Chat does not exist.' };
		return;
	}
	ctx.status = 404;
	ctx.body = { message: 'Location does not exist.' };
};

const sendMessage = async ctx => {
	let { id: locationId, chatId } = ctx.params;
	locationId = parseInt(locationId);
	chatId = parseInt(chatId);
	const { id: userId, role } = ctx.state.user;
	// Making sure staffLoc doesn't throw an error if nothing returned
	const { locationId: staffLoc } = (await staffModel.getByUserId(userId)) || {};
	const location = await locationsModel.getById(locationId);
	if (location) {
		const chat = await chatModel.getById(chatId);
		if (chat) {
			const { userId: chatUser } = chat;
			const permission = await can.message.create(
				role,
				userId,
				chatUser,
				staffLoc,
				locationId
			);
			if (!permission.granted) {
				ctx.status = 403;
				return;
			}
			const { body } = ctx.request;
			// Since chats are limited to two users, we can use a boolean
			// to decide who sent what message. 0 for staff, 1 for users.
			const sender = ctx.state.user.role === 'staff' ? 0 : 1;
			body.sender = sender;

			const messageId = await messagesModel.add(body);
			await chatMessagesModel.add(chatId, messageId);

			ctx.status = 201;
			ctx.body = {
				id: messageId,
				created: true,
				link: `${ctx.protocol}://${ctx.host}${ctx.request.path}/${messageId}`
			};
			return;
		}
		ctx.status = 404;
		ctx.body = { message: 'Chat does not exist.' };
		return;
	}
	ctx.status = 404;
	ctx.body = { message: 'Location does not exist.' };
};

const getMessage = async (ctx, next) => {
	let { id: locationId, chatId, messageId } = ctx.params;
	locationId = parseInt(locationId);
	chatId = parseInt(chatId);
	const { id: userId, role } = ctx.state.user;
	// Making sure staffLoc doesn't throw an error if nothing returned
	const { locationId: staffLoc } = (await staffModel.getByUserId(userId)) || {};
	const location = await locationsModel.getById(locationId);
	if (location) {
		const chat = await chatModel.getById(chatId);
		if (chat) {
			const { userId: chatUser } = chat;
			const permission = await can.message.create(
				role,
				userId,
				chatUser,
				staffLoc,
				locationId
			);
			if (!permission.granted) {
				ctx.status = 403;
				return;
			}
			const message = await messagesModel.getById(messageId);
			if (message) {
				ctx.body = message;
				return next();
			}
			ctx.status = 404;
			ctx.body = { message: 'Message does not exist.' };
			return;
		}
		ctx.status = 404;
		ctx.body = { message: 'Chat does not exist.' };
		return;
	}
	ctx.status = 404;
	ctx.body = { message: 'Location does not exist.' };
};

const deleteMessage = async ctx => {
	const locationId = parseInt(ctx.params.id);
	const chatId = parseInt(ctx.params.chatId);
	const messageId = parseInt(ctx.params.messageId);
	const { id: userId, role } = ctx.state.user;
	// Making sure staffLoc doesn't throw an error if nothing returned
	const { locationId: staffLoc } = (await staffModel.getByUserId(userId)) || {};
	const location = await locationsModel.getById(locationId);
	// Checking if location exists
	if (location) {
		const chat = await chatModel.getById(chatId);
		// Checking if chat exists
		if (chat) {
			const { userId: chatUser } = chat;
			const message = await messagesModel.getById(messageId);
			// Checking if message exists
			if (message) {
				const { sender } = message;
				const permission = await can.message.delete(
					role,
					sender,
					userId,
					chatUser,
					staffLoc,
					locationId
				);
				if (!permission.granted) {
					ctx.status = 403;
					return;
				}
				await chatMessagesModel.delete(messageId);
				await messagesModel.delete(messageId);
				ctx.body = { id: messageId, deleted: true };
				return;
			}
			ctx.status = 404;
			ctx.body = { message: 'Message does not exist.' };
			return;
		}
		ctx.status = 404;
		ctx.body = { message: 'Chat does not exist.' };
		return;
	}
	ctx.status = 404;
	ctx.body = { message: 'Location does not exist.' };
};

router.get('/', getAll, ifNoneMatch);
router.post('/', auth, validateLocation, addLocation);

router.get('/:id([0-9]+)', getLocation, ifModifiedSince);
router.put('/:id([0-9]+)', auth, validateLocationUpdate, updateLocation);
router.del('/:id([0-9]+)', auth, deleteLocation);

router.get('/:id([0-9]+)/dogs', getLocationDogs, ifNoneMatch);

router.get('/:id([0-9]+)/chats', auth, getAllChats, ifNoneMatch);
router.post('/:id([0-9]+)/chats', auth, createChat);

router.get('/:id([0-9]+)/chats/:chatId', auth, getChat, ifNoneMatch);
router.del('/:id([0-9]+)/chats/:chatId', auth, deleteChat);

router.get('/:id([0-9]+)/chats/:chatId/messages', auth, getMessages, ifNoneMatch);
router.post('/:id([0-9]+)/chats/:chatId/messages', auth, sendMessage);

router.get('/:id([0-9]+)/chats/:chatId/messages/:messageId', auth, getMessage, ifModifiedSince);
router.del('/:id([0-9]+)/chats/:chatId/messages/:messageId', auth, deleteMessage);

module.exports = router;
