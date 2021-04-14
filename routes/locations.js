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
const userModel = require('../models/users');
const staffModel = require('../models/staff');

const { auth } = require('../controllers/auth');

const can = require('../permissions/locations');

const router = new Router({ prefix: '/api/v1/locations' });
router.use(bodyParser());

/**
 * Gets all the locations from the database.
 * @param {object} ctx context passed from Koa.
 */
const getAll = async ctx => {
	ctx.body = await locationsModel.getAll();
};

/**
 * Gets a single location from the database by ID.
 * @param {object} ctx context passed from Koa.
 */
const getLocation = async ctx => {
	const id = ctx.params.id;
	try {
		const location = await locationsModel.getById(id);
		if (location) ctx.body = location;
	} catch (err) {
		ctx.status = 500;
		ctx.body = err;
	}
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
	try {
		const id = await locationsModel.add(body);
		if (id) {
			ctx.status = 201;
			ctx.body = { id, created: true, link: `${ctx.request.path}/${id}` };
		}
	} catch (err) {
		ctx.status = 500;
		ctx.body = err;
	}
};

/**
 * Updates a location in the database by ID.
 * @param {object} ctx context passed from Koa.
 */
const updateLocation = async ctx => {
	const locationId = ctx.params.id;
	try {
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
			const result = await locationsModel.update(locationId, body);
			// Knex returns amount of affected rows.
			if (result)
				ctx.body = {
					id: locationId,
					updated: true,
					link: ctx.request.path
				};
		}
	} catch (err) {
		ctx.status = 500;
		ctx.body = err;
	}
};

/**
 * Deletes a location from the database by ID.
 * @param {object} ctx context passed from Koa.
 */
const deleteLocation = async ctx => {
	const locationId = ctx.params.id;
	try {
		const location = await locationsModel.getById(locationId);
		if (location) {
			const { role } = ctx.state.user;
			const permission = await can.location.delete(role);
			if (!permission.granted) {
				ctx.status = 403;
				return;
			}
			const result = await locationsModel.delete(locationId);
			if (result) ctx.body = { id: locationId, deleted: true };
		}
	} catch (err) {
		ctx.status = 500;
		ctx.body = err;
	}
};

/**
 * Gets all the dogs at a location by ID.
 * @param {object} ctx context passed from Koa.
 */
const getLocationDogs = async ctx => {
	const locationId = ctx.params.id;
	try {
		const location = await locationsModel.getById(locationId);
		if (location) {
			const locationDogs = await dogLocationsModel.getByLocationId(locationId);
			if (locationDogs) ctx.body = locationDogs;
		}
	} catch (err) {
		ctx.status = 500;
		ctx.body = err;
	}
};

/**
 * Gets all chats at a location by ID.
 * @param {object} ctx context passed from Koa.
 */
const getAllChats = async ctx => {
	const locationId = ctx.params.id;
	try {
		const { id: userId, role } = ctx.state.user;
		const { locationId: staffLoc } = (await staffModel.getByUserId(userId)) || {};
		const location = await locationsModel.getById(locationId);
		if (location) {
			const permission = await can.chat.readAll(role, staffLoc, locationId);
			if (!permission.granted) {
				ctx.status = 403;
				return;
			}
			const chats = await chatModel.getAll(locationId);
			if (chats) ctx.body = chats;
		}
	} catch (err) {
		ctx.status = 500;
		ctx.body = err;
	}
};

const createChat = async ctx => {
	const locationId = ctx.params.id;
	const { id: userId, role } = ctx.state.user;
	const permission = await can.chat.create(role);
	if (!permission.granted) {
		ctx.status = 403;
		return;
	}
	try {
		const user = await userModel.getById(userId);
		if (user) {
			const id = await chatModel.add(locationId, userId);
			if (id) {
				ctx.status = 201;
				ctx.body = { id, created: true, link: `${ctx.request.path}/${id}` };
			}
		}
	} catch (err) {
		ctx.status = 500;
		ctx.body = err;
	}
};

const getChat = async ctx => {
	const { id: locationId, chatId } = ctx.params;
	const { id: userId, role } = ctx.state.user;
	try {
		const { locationId: staffLoc } = (await staffModel.getByUserId(userId)) || {};
		const chat = await chatModel.getById(chatId);
		if (chat) {
			const { userId: chatUser } = chat;
			const permission = await can.chat.read(role, userId, chatUser, staffLoc, locationId);
			if (!permission.granted) {
				ctx.status = 403;
				return;
			}
			ctx.body = chat;
		}
	} catch (err) {
		ctx.status = 500;
		ctx.body = err;
	}
};

const getMessages = async ctx => {
	const { id: locationId, chatId } = ctx.params;
	const { id: userId, role } = ctx.state.user;
	try {
		const { locationId: staffLoc } = (await staffModel.getByUserId(userId)) || {};
		const chat = await chatModel.getById(chatId);
		if (chat) {
			const { userId: chatUser } = chat;
			const chatMessages = await chatMessagesModel.getByChatId(chatId);
			if (chatMessages) {
				const permission = await can.message.read(
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
				ctx.body = chatMessages;
			}
		}
	} catch (err) {
		ctx.status = 500;
		ctx.body = err;
	}
};

const sendMessage = async ctx => {
	const { id: locationId, chatId } = ctx.params;
	const { id: userId, role } = ctx.state.user;
	try {
		const { locationId: staffLoc } = (await staffModel.getByUserId(userId)) || {};
		const chat = await chatModel.getById(chatId);
		if (chat) {
			const { userId: chatUser } = await chatMessagesModel.getByChatId(chatId);
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
			const { body } = ctx.request.body;
			const sender = ctx.state.user.role === 'staff' ? 0 : 1;
			body.sender = sender;

			const messageId = await messagesModel.add(body);
			if (messageId) {
				const result = await chatMessagesModel.add(chatId, messageId);
				if (result) {
					ctx.status = 201;
					ctx.body = {
						id: messageId,
						created: true,
						link: `${ctx.request.path}/${messageId}`
					};
				}
			}
		}
	} catch (err) {
		ctx.status = 500;
		ctx.body = err;
	}
};

const getMessage = async ctx => {
	const { id: locationId, chatId, messageId } = ctx.params;
	const { id: userId, role } = ctx.state.user;
	try {
		const { locationId: staffLoc } = (await staffModel.getByUserId(userId)) || {};
		const chat = await chatModel.getById(chatId);
		if (chat) {
			const { userId: chatUser } = await chatMessagesModel.getByChatId(chatId);
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
			if (message) ctx.body = message;
		}
	} catch (err) {
		ctx.status = 500;
		ctx.body = err;
	}
};

const deleteMessage = async ctx => {
	const { id: locationId, chatId, messageId } = ctx.params;
	const { id: userId, role } = ctx.state.user;
	try {
		const { locationId: staffLoc } = (await staffModel.getByUserId(userId)) || {};
		const chat = await chatModel.getById(chatId);
		if (chat) {
			const { userId: chatUser } = await chatMessagesModel.getByChatId(chatId);
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
			const chatMessageResult = await chatMessagesModel.delete(messageId);
			if (chatMessageResult) {
				const messageResult = await messagesModel.delete(messageId);
				if (messageResult) ctx.body = { id: messageId, deleted: true };
			}
		}
	} catch (err) {
		ctx.status = 500;
		ctx.body = err;
	}
};

router.get('/', getAll);
router.post('/', auth, addLocation);

router.get('/:id([0-9]+)', getLocation);
router.put('/:id([0-9]+)', auth, updateLocation);
router.del('/:id([0-9]+)', auth, deleteLocation);

router.get('/:id([0-9]+)/dogs', getLocationDogs);

router.get('/:id([0-9]+)/chats', auth, getAllChats);
router.post('/:id([0-9]+)/chats', auth, createChat);

router.get('/:id([0-9]+)/chats/:chatId', auth, getChat);
router.get('/:id([0-9]+)/chats/:chatId/messages', auth, getMessages);
router.post('/:id([0-9]+)/chats/:chatId/messages', auth, sendMessage);

router.get('/:id([0-9]+)/chats/:chatId/messages/:messageId', auth, getMessage);
router.del('/:id([0-9]+)/chats/:chatId/messages/:messageId', auth, deleteMessage);

module.exports = router;
