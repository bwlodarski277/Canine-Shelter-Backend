'use strict';

/**
 * @file Users route endpoints.
 * @module routes/users
 * @author Bartlomiej Wlodarski
 */

const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');

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

const prefix = '/api/v1/users';
const router = new Router({ prefix });

router.use(bodyParser());

/**
 * Gets all the users from the database.
 * @param {object} ctx context passed from Koa.
 */
const getAll = async ctx => {
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
	limit = clamp(limit, 1, 20); // Clamping the limit to be between 1 and 20.
	direction = direction === 'desc' ? 'desc' : 'asc';
	if (!Array.isArray(select)) select = Array(select);
	let users = await userModel.getAll(query, page, limit, order, direction);
	users = users.map(user => {
		// filtering out fields the user can't see
		user = permission.filter(user);
		// Selecting fields the user wants]
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
};

/**
 * Gets a single user from the database.
 * @param {object} ctx context passed from Koa.
 */
const getUser = async ctx => {
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
			favourites: `${self}/favourites`,
			chats: `${self}/chats`
		};
		ctx.body = partial;
	}
};

/**
 * Adds a user to the database.
 * @param {object} ctx context passed from Koa.
 */
const createUser = async ctx => {
	const { staffKey, ...body } = ctx.request.body;
	const { username, email } = body;
	// Giving the user the role 'staff' if they provide right key.
	body.role = staffKey === config.staffKey ? 'staff' : 'user';
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
	ctx.body = { id, created: true, link: `${ctx.request.path}/${id}` };
};

/**
 * Updates a user in the database.
 * @param {object} ctx context passed from Koa.
 */
const updateUser = async ctx => {
	const { id: userId, role } = ctx.state.user;
	const id = parseInt(ctx.params.id);
	const user = await userModel.getById(id);
	if (user) {
		const permission = await can.user.modify(role, userId, id);
		if (!permission.granted) {
			ctx.status = 403;
			return;
		}
		const { body } = ctx.request;
		await userModel.update(id, body);
		ctx.body = { id: id, updated: true, link: ctx.request.path };
	}
};

/**
 * Deletes a user from the database.
 * @param {object} ctx context passed from Koa.
 */
const deleteUser = async ctx => {
	const id = parseInt(ctx.params.id);
	const { id: userId, role } = ctx.state.user;
	const user = await userModel.getById(id);
	if (user) {
		const permission = await can.user.delete(role, userId, id);
		if (!permission.granted) {
			ctx.status = 403;
			return;
		}
		await userModel.delete(id);
		ctx.body = { id, deleted: true };
	}
};

/**
 * Gets a user's favourites.
 * @param {object} ctx context passed from Koa.
 */
const getUserFavs = async ctx => {
	const id = parseInt(ctx.params.id);
	const { id: userId, role } = ctx.state.user;
	const user = await userModel.getById(id);
	if (user) {
		const permission = await can.favourite.get(role, userId, id);
		if (!permission.granted) {
			ctx.status = 403;
			return;
		}
		const favourites = await favsModel.getByUserId(id);
		ctx.body = favourites;
	}
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
				link: `${ctx.request.path}/${favId}`
			};
		} else {
			ctx.status = 400;
			ctx.body = { message: 'Dog does not exist.' };
		}
	}
};

/**
 * Gets a user's favourite from the database by dog ID.
 * @param {object} ctx context passed from Koa.
 */
const getUserFav = async ctx => {
	let { id, favId } = ctx.params;
	id = parseInt(id);
	favId = parseInt(favId);
	const { id: userId, role } = ctx.state.user;
	const user = await userModel.getById(id);
	if (user) {
		const favourite = await favsModel.getSingleFav(favId);
		if (favourite) {
			const permission = await can.favourite.get(role, userId, id);
			if (!permission.granted) {
				ctx.status = 403;
				return;
			}
			ctx.body = favourite;
		}
	}
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
		}
	}
};

/**
 * Gets a user's chats by their ID.
 * @param {object} ctx context passed from koa.
 */
const getUserChats = async ctx => {
	const userId = parseInt(ctx.params.id);
	const { id, role } = ctx.state.user;
	const user = await userModel.getById(userId);
	if (user) {
		const permission = await can.user.get(role, userId, id);
		if (!permission.granted) {
			ctx.status = 403;
			return;
		}
		const chats = await chatModel.getByUserId(userId);
		ctx.body = chats;
	}
};

router.get('/', auth, getAll);
router.post('/', validateUser, createUser);

router.get('/:id([0-9]+)', auth, getUser);
router.put('/:id([0-9]+)', auth, validateUserUpdate, updateUser);
router.del('/:id([0-9]+)', auth, deleteUser);

router.get('/:id([0-9]+)/favourites', auth, getUserFavs);
router.post('/:id([0-9]+)/favourites', auth, validateFavourite, addUserFav);

router.get('/:id([0-9]+)/favourites/:favId([0-9]+)', auth, getUserFav);
router.del('/:id([0-9]+)/favourites/:favId([0-9]+)', auth, deleteUserFav);

router.get('/:id([0-9]+)/chats', auth, getUserChats);

module.exports = router;
