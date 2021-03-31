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

router.get('/', auth, getAll);
router.post('/', bodyParser(), validateUser, createUser);

router.get('/:id([0-9]+)', auth, getUser);
router.put('/:id([0-9]+)', auth, bodyParser(), validateUser, updateUser);
router.del('/:id([0-9]+)', auth, deleteUser);

router.get('/:id([0-9]+)/favourites', auth, getUserFavs);
router.post('/:id([0-9]+)/favourites', auth, bodyParser(), validateFavourite, addUserFav);

router.get('/:id([0-9]+)/favourites/:favId([0-9]+)', auth, getUserFav);
router.del('/:id([0-9]+)/favourites/:favId([0-9]+)', auth, deleteUserFav);

/**
 * Gets all the users from the database.
 * @param {object} ctx context passed from Koa.
 */
const getAll = async ctx => {
	const perm = await can.getAll(ctx.state.user);
	if (perm.granted) ctx.body = await userModel.getAll();
	else ctx.status = 403;
};

/**
 * Gets a single user from the database.
 * @param {object} ctx context passed from Koa.
 */
const getUser = async ctx => {
	const id = ctx.params.id;

	const user = await userModel.getById(id);
	if (user) ctx.body = user;
};

/**
 * Adds a user to the database.
 * @param {object} ctx context passed from Koa.
 */
const createUser = async ctx => {
	const { staffKey, role, ...body } = ctx.request.body;
	// Giving the user the role 'staff' if they provide right key.
	body.role = staffKey === config.staffKey ? 'staff' : 'user';
	const id = await userModel.add(body);
	if (id) {
		ctx.status = 201;
		ctx.body = { ID: id, created: true, link: `${ctx.request.path}/${id}` };
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

		const result = await userModel.update(userId, body);

		// Knex returns amount of affected rows.
		if (result) ctx.body = { id: userId, updated: true, link: ctx.request.path };
	}
};

/**
 * Deletes a user from the database.
 * @param {object} ctx context passed from Koa.
 */
const deleteUser = async ctx => {
	const id = ctx.params.id;
	const user = await userModel.getById(id);
	if (user) {
		const result = await userModel.delete(id);
		if (result) ctx.body = { id, deleted: true };
	}
};

/**
 * Gets a user's favourites.
 * @param {object} ctx context passed from Koa.
 */
const getUserFavs = async ctx => {
	const id = ctx.params.id;
	const favourites = await favsModel.getByUserId(id);
	if (favourites) ctx.body = favourites;
};

/**
 * Adds a dog to a user's favourites by dog ID.
 * @param {object} ctx context passed from Koa.
 */
const addUserFav = async ctx => {
	const userId = ctx.params.id;
	const { dogId } = ctx.request.body;
	const result = await favsModel.add(userId, dogId);
	if (result) {
		ctx.status = 201;
		ctx.body = {
			id: userId,
			created: true,
			link: `${ctx.request.path}/${dogId}`
		};
	}
};

/**
 * Gets a user's favourite from the database by dog ID.
 * @param {object} ctx context passed from Koa.
 */
const getUserFav = async ctx => {
	const favId = ctx.params.favId;
	const result = await favsModel.getSingleFav(favId);
	if (result) ctx.body = result;
};

/**
 * Delete a user's favourite dog by ID.
 * @param {object} ctx context passed from Koa.
 */
const deleteUserFav = async ctx => {
	const favId = ctx.params.favId;
	const result = await favsModel.delete(favId);
	if (result) ctx.body = { id: favId, deleted: true };
};

module.exports = router;
