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

const auth = require('../controllers/auth');

const router = new Router({ prefix: '/api/v1/locations' });

router.get('/', getAll);
router.post('/', auth, bodyParser(), addLocation);

router.get('/:id([0-9]+)', getLocation);
router.put('/:id([0-9]+)', auth, bodyParser(), updateLocation);
router.del('/:id([0-9]+)', auth, deleteLocation);

router.get('/:id([0-9]+)/dogs', getLocationDogs);

router.get('/:id([0-9]+)/chats', auth, getAllChats);
router.post('/:id([0-9]+)/chats', auth, bodyParser(), createChat);

router.get('/:id([0-9]+)/chats/:chatId', auth, getChat);
router.get('/:id([0-9]+)/chats/:chatId/messages', auth, getMessages);
router.post('/:id([0-9]+)/chats/:chatId/messages', auth, bodyParser(), sendMessage);

router.get('/:id([0-9]+)/chats/:chatId/messages/:messageId', auth, getMessage);
router.del('/:id([0-9]+)/chats/:chatId/messages/:messageId', auth, deleteMessage);

/**
 * Gets all the locations from the database.
 * @param {object} ctx context passed from Koa.
 */
async function getAll(ctx) {
    ctx.body = await locationsModel.getAll();
}

/**
 * Gets a single location from the database by ID.
 * @param {object} ctx context passed from Koa.
 */
async function getLocation(ctx) {
    const id = ctx.params.id;
    const location = await locationsModel.getById(id);
    if (location) {
        ctx.body = location;
    }
}

/**
 * Adds a location to the database.
 * @param {object} ctx context passed from Koa.
 */
async function addLocation(ctx) {
    const body = ctx.request.body;
    const id = await locationsModel.add(body);
    if (id) {
        ctx.status = 201;
        ctx.body = { id, created: true, link: `${ctx.request.path}/${id}` };
    }
}

/**
 * Updates a location in the database by ID.
 * @param {object} ctx context passed from Koa.
 */
async function updateLocation(ctx) {
    const locationId = ctx.params.id;
    let location = await locationsModel.getById(locationId);
    if (location) {
        // Excluding fields that must not be updated
        const { id, ...body } = ctx.request.body;

        const result = await locationsModel.update(locationId, body);

        // Knex returns amount of affected rows.
        if (result) {
            ctx.body = { id: locationId, updated: true, link: ctx.request.path };
        }
    }
}

/**
 * Deletes a location from the database by ID.
 * @param {object} ctx context passed from Koa.
 */
async function deleteLocation(ctx) {
    const id = ctx.params.id;
    let location = await locationsModel.getById(id);
    if (location) {
        const result = await locationsModel.delete(id);
        if (result) {
            ctx.body = { id, deleted: true };
        }
    }
}

/**
 * Gets all the dogs at a location by ID..
 * @param {object} ctx context passed from Koa.
 */
async function getLocationDogs(ctx) {
    const id = ctx.params.id;
    const locationDogs = await dogLocationsModel.getByLocationId(id);
    if (locationDogs) {
        ctx.body = locationDogs;
    }
}

async function getAllChats(ctx) {
    const { id } = ctx.params;
    const chats = await chatModel.getAll(id);
    if (chats) {
        ctx.body = chats;
    }
}

async function createChat(ctx) {
    const locationId = ctx.params.id;
    const { userId } = ctx.request.body;
    const user = await userModel.getById(userId);
    if (user) {
        const id = await chatModel.add(locationId, userId);
        if (id) {
            ctx.status = 201;
            ctx.body = { id, created: true, link: `${ctx.request.path}/${id}` };
        }
    }
}

async function getChat(ctx) {
    const { chatId } = ctx.params;
    const chat = await chatModel.getById(chatId);
    if (chat) {
        ctx.body = chat;
    }
}

async function getMessages(ctx) {
    const { chatId } = ctx.params;
    const messages = await chatMessagesModel.getByChatId(chatId);
    if (messages) {
        ctx.body = messages;
    }
}

async function sendMessage(ctx) {
    const { chatId } = ctx.params;
    const chat = await chatModel.getById(chatId);
    if (chat) {
        let { sender, ...body } = ctx.request.body;
        sender = ctx.state.user.role === 'staff' ? 0 : 1;
        body.sender = sender;
        const messageId = await messagesModel.add(body);
        if (messageId) {
            const result = await chatMessagesModel.add(chatId, messageId);
            if (result) {
                ctx.status = 201;
                ctx.body = { id: messageId, created: true, link: `${ctx.request.path}/${messageId}` };
            }
        }
    }
}

async function getMessage(ctx) {
    const { messageId } = ctx.params;
    const message = await messagesModel.getById(messageId);
    if (message) {
        ctx.body = message;
    }
}

async function deleteMessage(ctx) {
    const { messageId } = ctx.params;
    const chatMessageResult = await chatMessagesModel.delete(messageId);
    if (chatMessageResult) {
        const messageResult = await messagesModel.delete(messageId);
        if (messageResult) {
            ctx.body = { id: messageId, deleted: true };
        }
    }
}

module.exports = router;