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

const router = new Router({ prefix: '/api/v1/breeds' });
router.use(bodyParser());

/**
 * Gets all the breeds from the database.
 * @param {object} ctx context passed from Koa.
 */
const getAll = async ctx => {
	ctx.body = await breedModel.getAll();
};

const getDogs = async ctx => {
	const id = ctx.params.id;
	try {
		const dogs = await dogBreedModel.getByBreedId(id);
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
	const id = ctx.params.id;
	try {
		const breed = await breedModel.getById(id);
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
	const body = ctx.request.body;
	try {
		const id = await breedModel.add(body);
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
 * Updates a breed in the database by breed ID.
 * @param {object} ctx context passed from Koa.
 */
const updateBreed = async ctx => {
	const breedId = ctx.params.id;
	try {
		const breed = await breedModel.getById(breedId);
		if (breed) {
			// Excluding fields that must not be updated
			const { id, ...body } = ctx.request.body;
			const result = await breedModel.update(breedId, body);
			// Knex returns amount of affected rows.
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
	const id = ctx.params.id;
	try {
		const breed = await breedModel.getById(id);
		if (breed) {
			const result = await breedModel.delete(id);
			if (result) ctx.body = { id, deleted: true };
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
