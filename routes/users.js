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

const { auth } = require('../controllers/auth');
const { config } = require('../config');

const { validateUser, validateFavourite } = require('../controllers/validation');

const can = require('../permissions/users');

const router = new Router({ prefix: '/api/v1/users' });
router.use(bodyParser());

/**
 * Gets all the users from the database.
 * @param {object} ctx context passed from Koa.
 */
const getAll = async ctx => {
	const perm = await can.getAll(ctx.state.user);
	if (perm.granted)
		try {
			ctx.body = await userModel.getAll();
		} catch (err) {
			ctx.status = 500;
			ctx.body = err;
		}
	else ctx.status = 403;
};

/**
 * Gets a single user from the database.
 * @param {object} ctx context passed from Koa.
 */
const getUser = async ctx => {
	const id = ctx.params.id;
	try {
		const user = await userModel.getById(id);
		if (user) ctx.body = user;
	} catch (err) {
		ctx.status = 500;
		ctx.body = err;
	}
};

/**
 * Adds a user to the database.
 * @param {object} ctx context passed from Koa.
 */
const createUser = async ctx => {
	const { staffKey, role, ...body } = ctx.request.body;
	// Giving the user the role 'staff' if they provide right key.
	body.role = staffKey === config.staffKey ? 'staff' : 'user';
	try {
		const id = await userModel.add(body);
		if (id) {
			ctx.status = 201;
			ctx.body = { ID: id, created: true, link: `${ctx.request.path}/${id}` };
		}
	} catch (err) {
		ctx.status = 500;
		ctx.body = err;
	}
};

/**
 * Updates a user in the database.
 * @param {object} ctx context passed from Koa.
 */
const updateUser = async ctx => {
	const userId = ctx.params.id;
	const user = await userModel.getById(userId);
	if (user) {
		// Excluding fields that must not be updated
		const { id, dateCreated, ...body } = ctx.request.body;
		try {
			const result = await userModel.update(userId, body);
			// Knex returns amount of affected rows.
			if (result) ctx.body = { id: userId, updated: true, link: ctx.request.path };
		} catch (err) {
			ctx.status = 500;
			ctx.body = err;
		}
	}
};

/**
 * Deletes a user from the database.
 * @param {object} ctx context passed from Koa.
 */
const deleteUser = async ctx => {
	const id = ctx.params.id;
	try {
		const user = await userModel.getById(id);
		if (user) {
			const result = await userModel.delete(id);
			if (result) ctx.body = { id, deleted: true };
		}
	} catch (err) {
		ctx.status = 500;
		ctx.body = err;
	}
};

/**
 * Gets a user's favourites.
 * @param {object} ctx context passed from Koa.
 */
const getUserFavs = async ctx => {
	const id = ctx.params.id;
	try {
		const favourites = await favsModel.getByUserId(id);
		if (favourites) ctx.body = favourites;
	} catch (err) {
		ctx.status = 500;
		ctx.body = err;
	}
};

/**
 * Adds a dog to a user's favourites by dog ID.
 * @param {object} ctx context passed from Koa.
 */
const addUserFav = async ctx => {
	const userId = ctx.params.id;
	const { dogId } = ctx.request.body;
	try {
		const result = await favsModel.add(userId, dogId);
		if (result) {
			ctx.status = 201;
			ctx.body = {
				id: userId,
				created: true,
				link: `${ctx.request.path}/${dogId}`
			};
		}
	} catch (err) {
		ctx.status = 500;
		ctx.body = err;
	}
};

/**
 * Gets a user's favourite from the database by dog ID.
 * @param {object} ctx context passed from Koa.
 */
const getUserFav = async ctx => {
	const favId = ctx.params.favId;
	try {
		const result = await favsModel.getSingleFav(favId);
		if (result) ctx.body = result;
	} catch (err) {
		ctx.status = 500;
		ctx.body = err;
	}
};

/**
 * Delete a user's favourite dog by ID.
 * @param {object} ctx context passed from Koa.
 */
const deleteUserFav = async ctx => {
	const favId = ctx.params.favId;
	try {
		const result = await favsModel.delete(favId);
		if (result) ctx.body = { id: favId, deleted: true };
	} catch (err) {
		ctx.status = 500;
		ctx.body = err;
	}
};

router.get('/', auth, getAll);
router.post('/', validateUser, createUser);

router.get('/:id([0-9]+)', auth, getUser);
router.put('/:id([0-9]+)', auth, validateUser, updateUser);
router.del('/:id([0-9]+)', auth, deleteUser);

router.get('/:id([0-9]+)/favourites', auth, getUserFavs);
router.post('/:id([0-9]+)/favourites', auth, validateFavourite, addUserFav);

router.get('/:id([0-9]+)/favourites/:favId([0-9]+)', auth, getUserFav);
router.del('/:id([0-9]+)/favourites/:favId([0-9]+)', auth, deleteUserFav);

module.exports = router;
