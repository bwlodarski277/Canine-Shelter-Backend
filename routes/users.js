'use strict';

/**
 * @file Users route endpoints.
 * @module routes/users
 * @author Bartlomiej Wlodarski
 */

const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');

// const fs = require('fs');
// const uploadDir = '/tmp/api/uploads';
// const fileStore = '/var/tmp/api/public/images';

// const koaBody = require('koa-body')({
// 	multipart: true,
// 	formidable: { uploadDir }
// });

// const mime = require('mime-types');

const userModel = require('../models/users');
const favsModel = require('../models/favourites');
const chatModel = require('../models/chats');
const dogModel = require('../models/dogs');

const { auth } = require('../controllers/auth');
const { config } = require('../config');

const {
	validateUser,
	validateUserUpdate,
	validateFavourite
} = require('../controllers/validation');

const can = require('../permissions/users');
const { clamp } = require('../helpers/utils');
const { ifNoneMatch, ifModifiedSince } = require('../helpers/caching');

const prefix = '/api/v1/users';
const router = new Router({ prefix });

router.use(bodyParser());

/**
 * Gets all the users from the database.
 * @param {object} ctx context passed from Koa.
 */
const getAll = async (ctx, next) => {
	const permission = await can.user.getAll(ctx.state.user);
	if (!permission.granted) {
		ctx.status = 403;
		return;
	}
	let {
		query = '',
		select = [],
		page = 1,
		limit = 10,
		order = 'id',
		direction
	} = ctx.request.query;
	// Clamping the limit to be between 1 and 20.
	limit = clamp(limit, 1, 20);
	// Limiting direction to two possible values
	direction = direction === 'desc' ? 'desc' : 'asc';
	if (!Array.isArray(select)) select = Array(select);
	let users = await userModel.getAll(query, page, limit, order, direction);
	users = users.map(user => {
		// filtering out fields the user can't see
		user = permission.filter(user);
		// Selecting fields the user wants
		const partial = { id: user.id };
		select.map(field => (partial[field] = user[field]));
		const self = `${ctx.protocol}://${ctx.host}${prefix}/${partial.id}`;
		partial.links = {
			self: self,
			favourites: `${self}/favourites`,
			chats: `${self}/chats`
		};
		return partial;
	});
	ctx.body = users;
	return next();
};

/**
 * Gets a single user from the database.
 * @param {object} ctx context passed from Koa.
 */
const getUser = async (ctx, next) => {
	const id = parseInt(ctx.params.id);
	let { select = [] } = ctx.request.query;
	if (!Array.isArray(select)) select = Array(select);
	let user = await userModel.getById(id);
	if (user) {
		const { id: userId, role } = ctx.state.user;
		const permission = await can.user.get(role, userId, id);
		if (!permission.granted) {
			ctx.status = 403;
			return;
		}
		// filtering out fields the user can't see
		user = permission.filter(user);
		// Selecting fields the user wants
		let partial;
		// If nothing is selected, return everything
		if (select.length === 0) partial = user;
		else {
			partial = { id: user.id };
			select.map(field => (partial[field] = user[field]));
		}
		const self = `${ctx.protocol}://${ctx.host}${prefix}/${partial.id}`;
		partial.links = {
			self: self,
			favourites: `${self}/favourites`,
			chats: `${self}/chats`
		};
		ctx.body = partial;
		return next();
	}
	ctx.status = 404;
	ctx.body = { message: 'User does not exist.' };
};

/**
 * Adds a user to the database.
 * @param {object} ctx context passed from Koa.
 */
const createUser = async ctx => {
	const { staffKey, ...body } = ctx.request.body;
	const { username, email } = body;
	// Giving the user the role 'staff' if they provide right key.
	if (staffKey)
		if (staffKey === config.staffKey) body.role = 'staff';
		else {
			ctx.status = 400;
			ctx.body = { message: 'Invalid staff key.' };
			return;
		}
	else body.role = 'user';
	// Making sure username isn't taken
	let user = await userModel.getByUsername(username);
	if (user) {
		ctx.status = 400;
		ctx.body = { message: 'Username is taken.' };
		return;
	}
	// Making sure email isn't taken
	user = await userModel.getByEmail(email);
	if (user) {
		ctx.status = 400;
		ctx.body = { message: 'Email is taken.' };
		return;
	}
	const id = await userModel.add(body);

	ctx.status = 201;
	ctx.body = {
		id,
		created: true,
		link: `${ctx.protocol}://${ctx.host}${ctx.request.path}/${id}`
	};
};

/**
 * Updates a user in the database.
 * @param {object} ctx context passed from Koa.
 */
const updateUser = async ctx => {
	const { id: userId, role } = ctx.state.user;
	const id = parseInt(ctx.params.id);
	const user = await userModel.getById(id);
	// Making sure user exists
	if (user) {
		const permission = await can.user.modify(role, userId, id);
		if (!permission.granted) {
			ctx.status = 403;
			return;
		}
		const { body } = ctx.request;
		// Making sure username isn't taken
		let user = await userModel.getByUsername(body.username || null);
		if (user) {
			ctx.status = 400;
			ctx.body = { message: 'Username is taken.' };
			return;
		}
		// Making sure email isn't taken
		user = await userModel.getByEmail(body.email || null);
		if (user) {
			ctx.status = 400;
			ctx.body = { message: 'Email is taken.' };
			return;
		}
		await userModel.update(id, body);
		ctx.body = {
			id: id,
			updated: true,
			link: `${ctx.protocol}://${ctx.host}${ctx.request.path}`
		};
		return;
	}
	ctx.status = 404;
	ctx.body = { message: 'User does not exist.' };
};

/**
 * Deletes a user from the database.
 * @param {object} ctx context passed from Koa.
 */
const deleteUser = async ctx => {
	const id = parseInt(ctx.params.id);
	const { id: userId, role } = ctx.state.user;
	const user = await userModel.getById(id);
	// Making sure user exists
	if (user) {
		const permission = await can.user.delete(role, userId, id);
		if (!permission.granted) {
			ctx.status = 403;
			return;
		}
		await userModel.delete(id);
		ctx.body = { id, deleted: true };
		return;
	}
	ctx.status = 404;
	ctx.body = { message: 'User does not exist.' };
};

/**
 * Gets a user's favourites.
 * @param {object} ctx context passed from Koa.
 */
const getUserFavs = async (ctx, next) => {
	const id = parseInt(ctx.params.id);
	const { id: userId, role } = ctx.state.user;
	const user = await userModel.getById(id);
	// Making sure user exists
	if (user) {
		const permission = await can.favourite.get(role, userId, id);
		if (!permission.granted) {
			ctx.status = 403;
			return;
		}
		let favourites = await favsModel.getByUserId(id);
		favourites = favourites.map(favourite => {
			// Adding links
			favourite.links = {
				self: `${ctx.protocol}://${ctx.host}${prefix}/${id}/favourites/${favourite.id}`,
				dog: `${ctx.protocol}://${ctx.host}/api/v1/dogs/${favourite.dogId}`
			};
			return favourite;
		});
		ctx.body = favourites;
		return next();
	}
	ctx.status = 404;
	ctx.body = { message: 'User does not exist.' };
};

/**
 * Adds a dog to a user's favourites by dog ID.
 * @param {object} ctx context passed from Koa.
 */
const addUserFav = async ctx => {
	const id = parseInt(ctx.params.id);
	const { id: userId, role } = ctx.state.user;
	const { dogId } = ctx.request.body;
	const user = await userModel.getById(id);
	if (user) {
		const permission = await can.favourite.create(role, userId, id);
		if (!permission.granted) {
			ctx.status = 403;
			return;
		}
		const dog = await dogModel.getById(dogId);
		if (dog) {
			let favs = await favsModel.getByUserId(id);
			favs = favs.filter(fav => fav.dogId === dogId);
			if (favs.length) {
				ctx.status = 400;
				ctx.body = { message: 'Dog is already a favourite.' };
				return;
			}
			const favId = await favsModel.add(userId, dogId);
			ctx.status = 201;
			ctx.body = {
				id: favId,
				created: true,
				link: `${ctx.protocol}://${ctx.host}${ctx.request.path}/${favId}`
			};
			return;
		}
		ctx.status = 400;
		ctx.body = { message: 'Dog does not exist.' };
		return;
	}
	ctx.status = 404;
	ctx.body = { message: 'User does not exist.' };
};

/**
 * Gets a user's favourite from the database by dog ID.
 * @param {object} ctx context passed from Koa.
 */
const getUserFav = async (ctx, next) => {
	let { id, favId } = ctx.params;
	id = parseInt(id);
	favId = parseInt(favId);
	const { id: userId, role } = ctx.state.user;
	const user = await userModel.getById(id);
	// Checks if user exists
	if (user) {
		const favourite = await favsModel.getSingleFav(favId);
		// checks if favourite exists
		if (favourite) {
			const permission = await can.favourite.get(role, userId, id);
			if (!permission.granted) {
				ctx.status = 403;
				return;
			}
			favourite.links = {
				self: `${ctx.protocol}://${ctx.host}${prefix}/${id}/favourites/${favourite.id}`,
				dog: `${ctx.protocol}://${ctx.host}/api/v1/dogs/${favourite.dogId}`
			};
			ctx.body = favourite;
			return next();
		}
		ctx.status = 404;
		ctx.body = { message: 'Favourite does not exist.' };
		return;
	}
	ctx.status = 404;
	ctx.body = { message: 'User does not exist.' };
};

/**
 * Delete a user's favourite dog by ID.
 * @param {object} ctx context passed from Koa.
 */
const deleteUserFav = async ctx => {
	let { id, favId } = ctx.params;
	id = parseInt(id);
	favId = parseInt(favId);
	const { id: userId, role } = ctx.state.user;
	const user = await userModel.getById(id);
	if (user) {
		const favourite = await favsModel.getSingleFav(favId);
		if (favourite) {
			const permission = await can.favourite.delete(role, userId, id);
			if (!permission.granted) {
				ctx.status = 403;
				return;
			}
			await favsModel.delete(favId);
			ctx.body = { id: favId, deleted: true };
			return;
		}
		ctx.status = 404;
		ctx.body = { message: 'Favourite does not exist.' };
		return;
	}
	ctx.status = 404;
	ctx.body = { message: 'User does not exist.' };
};

/**
 * Gets a user's chats by their ID.
 * @param {object} ctx context passed from koa.
 */
const getUserChats = async (ctx, next) => {
	const userId = parseInt(ctx.params.id);
	const { id, role } = ctx.state.user;
	const user = await userModel.getById(userId);
	if (user) {
		const permission = await can.user.get(role, userId, id);
		if (!permission.granted) {
			ctx.status = 403;
			return;
		}
		let chats = await chatModel.getByUserId(userId);
		chats = chats.map(chat => {
			const { id: chatId, locationId, userId } = chat;
			const self = `${ctx.protocol}://${ctx.host}/api/v1/locations/${locationId}`;
			chat.links = {
				self: `${self}/chats/${chatId}`,
				messages: `${self}/chats/${chatId}/messages`,
				location: self,
				user: `${ctx.protocol}://${ctx.host}/api/v1/users/${userId}`
			};
			return chat;
		});
		ctx.body = chats;
		return next();
	}
	ctx.status = 404;
	ctx.body = { message: 'User does not exist.' };
};

router.get('/', auth, getAll, ifNoneMatch);
router.post('/', validateUser, createUser);

router.get('/:id([0-9]+)', auth, getUser, ifModifiedSince);
router.put('/:id([0-9]+)', auth, validateUserUpdate, updateUser);
router.del('/:id([0-9]+)', auth, deleteUser);

router.get('/:id([0-9]+)/favourites', auth, getUserFavs, ifNoneMatch);
router.post('/:id([0-9]+)/favourites', auth, validateFavourite, addUserFav);

router.get('/:id([0-9]+)/favourites/:favId([0-9]+)', auth, getUserFav, ifNoneMatch);
router.del('/:id([0-9]+)/favourites/:favId([0-9]+)', auth, deleteUserFav);

router.get('/:id([0-9]+)/chats', auth, getUserChats, ifNoneMatch);

module.exports = router;
