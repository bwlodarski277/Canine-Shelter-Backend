'use strict';

/**
 * @file Breeds route endpoints.
 * @module routes/breeds
 * @author Bartlomiej Wlodarski
 */

const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');

const breedModel = require('../models/breeds');
const dogBreedModel = require('../models/dogBreeds');

const { auth } = require('../controllers/auth');
const { clamp } = require('../helpers/utils');
const can = require('../permissions/breeds');

const router = new Router({ prefix: '/api/v1/breeds' });
router.use(bodyParser());

/**
 * Gets all the breeds from the database.
 * @param {object} ctx context passed from Koa.
 */
const getAll = async ctx => {
	let {
		query = '',
		select = ['*'],
		page = 1,
		limit = 10,
		order = 'id',
		direction
	} = ctx.request.query;
	limit = clamp(limit, 1, 20); // Clamping the limit to be between 1 and 20.
	direction = direction === 'desc' ? 'desc' : 'asc';
	if (!Array.isArray(select)) select = Array(select);
	try {
		ctx.body = await breedModel.getAll(query, select, page, limit, order, direction);
	} catch (err) {
		ctx.status = 500;
		ctx.body = err;
	}
};

const getDogs = async ctx => {
	const breedId = ctx.params.id;
	let { select = [] } = ctx.request.query;
	if (!Array.isArray(select)) select = Array(select);
	try {
		const dogs = await dogBreedModel.getByBreedId(breedId, select);
		if (dogs) ctx.body = dogs;
	} catch (err) {
		ctx.status = 500;
		ctx.body = err;
	}
};

/**
 * Gets a single breed from the database by breed ID.
 * @param {object} ctx context passed from Koa.
 */
const getBreed = async ctx => {
	const breedId = ctx.params.id;
	try {
		const breed = await breedModel.getById(breedId);
		if (breed) ctx.body = breed;
	} catch (err) {
		ctx.status = 500;
		ctx.body = err;
	}
};

/**
 * Adds a breed to the database.
 * @param {object} ctx context passed from Koa.
 */
const addBreed = async ctx => {
	const { role } = ctx.state.user;
	const permission = await can.create(role);
	if (!permission.granted) {
		ctx.status = 403;
		return;
	}
	try {
		const body = ctx.request.body;
		const breedId = await breedModel.add(body);
		if (breedId) {
			ctx.status = 201;
			ctx.body = { ID: breedId, created: true, link: `${ctx.request.path}/${breedId}` };
		}
	} catch (err) {
		ctx.status = 500;
		ctx.body = err;
	}
};

/**
 * Updates a breed in the database by breed ID.
 * @param {object} ctx context passed from Koa.
 */
const updateBreed = async ctx => {
	const { role } = ctx.state.user;
	const permission = await can.modify(role);
	if (!permission.granted) {
		ctx.status = 403;
		return;
	}
	try {
		const breedId = ctx.params.id;
		const breed = await breedModel.getById(breedId);
		if (breed) {
			const data = ctx.request.body;
			const result = await breedModel.update(breedId, data);
			if (result) ctx.body = { id: breedId, updated: true, link: ctx.request.path };
		}
	} catch (err) {
		ctx.status = 500;
		ctx.body = err;
	}
};

/**
 * Deletes a breed from the database by breed ID.
 * @param {object} ctx context passed from Koa.
 */
const deleteBreed = async ctx => {
	const { role } = ctx.state.user;
	const permission = await can.modify(role);
	if (!permission.granted) {
		ctx.status = 403;
		return;
	}
	try {
		const breedId = ctx.params.id;
		const breed = await breedModel.getById(breedId);
		if (breed) {
			const result = await breedModel.delete(breedId);
			if (result) ctx.body = { id: breedId, deleted: true };
		}
	} catch (err) {
		ctx.status = 500;
		ctx.body = err;
	}
};

router.get('/', getAll);
router.post('/', auth, addBreed);

router.get('/:id([0-9]+)', getBreed);
router.put('/:id([0-9]+)', auth, updateBreed);
router.del('/:id([0-9]+)', auth, deleteBreed);

router.get('/:id([0-9]+)/dogs', getDogs);

module.exports = router;
