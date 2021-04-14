'use strict';

/**
 * @file Dogs route endpoints.
 * @module routes/dogs
 * @author Bartlomiej Wlodarski
 */

const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');

const dogModel = require('../models/dogs');
const dogBreedModel = require('../models/dogBreeds');
const dogLocationModel = require('../models/dogLocations');
const favouritesModel = require('../models/favourites');
const staffModel = require('../models/staff');

const { validateDog, validateDogBreed, validateDogLocation } = require('../controllers/validation');
const can = require('../permissions/dogs');

const { auth } = require('../controllers/auth');
const { clamp } = require('../helpers/utils');

const router = new Router({ prefix: '/api/v1/dogs' });
router.use(bodyParser());

/**
 * Gets all the dogs from the database.
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
		const dogs = await dogModel.getAll(query, select, page, limit, order, direction);
		if (dogs.length) ctx.body = dogs;
	} catch (err) {
		ctx.status = 500;
		ctx.body = err;
	}
};

/**
 * Gets a single dog from the database by ID.
 * @param {object} ctx context passed from Koa.
 */
const getDog = async ctx => {
	const id = ctx.params.id;
	let { select = [] } = ctx.request.query;
	if (!Array.isArray(select)) select = Array(select);
	try {
		const dog = await dogModel.getById(id, select);
		if (dog) ctx.body = dog;
	} catch (err) {
		ctx.status = 500;
		ctx.body = err;
	}
};

/**
 * Adds a dog to the database.
 * @param {object} ctx context passed from Koa.
 */
const addDog = async ctx => {
	const { role } = ctx.state.user;
	const permission = await can.dog.create(role);
	if (!permission.granted) {
		ctx.status = 403;
		return;
	}
	const body = ctx.request.body;
	try {
		const id = await dogModel.add(body);
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
 * Updates a dog in the database by ID.
 * @param {object} ctx context passed from Koa.
 */
const updateDog = async ctx => {
	const dogId = ctx.params.id;
	try {
		const dog = await dogModel.getById(dogId, []);
		if (dog) {
			const { id: userId, role } = ctx.state.user;
			const { locationId: userLoc } = (await staffModel.getByUserId(userId)) || {};
			const { locationId: dogLoc } = (await dogLocationModel.getByDogId(dogId)) || {};
			// If a user is a staff member
			const permission = await can.dog.modify(role, userLoc, dogLoc);
			if (!permission.granted) {
				ctx.status = 403;
				return;
			}
			// Excluding fields that must not be updated
			const { id, dateCreated, dateModified, ...body } = ctx.request.body;
			const result = await dogModel.update(dogId, body);
			if (result) {
				ctx.status = 201;
				ctx.body = { id: dogId, updated: true, link: ctx.request.path };
			}
		}
	} catch (err) {
		ctx.status = 500;
		ctx.body = err;
	}
};

/**
 * Deletes a dog from the database by ID.
 * @param {object} ctx context passed from Koa.
 */
const deleteDog = async ctx => {
	const dogId = ctx.params.id;
	try {
		const dog = await dogModel.getById(dogId);
		if (dog) {
			const { id: userId, role } = ctx.state.user;
			const { locationId: userLoc } = (await staffModel.getByUserId(userId)) || {};
			const { locationId: dogLoc } = (await dogLocationModel.getByDogId(dogId)) || {};

			const permission = await can.dog.delete(role, userLoc, dogLoc);
			if (!permission.granted) {
				ctx.status = 403;
				return;
			}
			const result = await dogModel.delete(dogId);
			if (result) ctx.stbody = { id: dogId, deleted: true };
		}
	} catch (err) {
		ctx.status = 500;
		ctx.body = err;
	}
};

/**
 * Gets a dog's breed by the dog ID.
 * @param {object} ctx context passed from Koa.
 */
const getDogBreed = async ctx => {
	const id = ctx.params.id;
	try {
		const dogBreed = await dogBreedModel.getByDogId(id);
		if (dogBreed) ctx.body = dogBreed;
	} catch (err) {
		ctx.status = 500;
		ctx.body = err;
	}
};

/**
 * Sets a dog's breed by the dog's ID and breed ID.
 * @param {object} ctx context passed from Koa.
 */
const addDogBreed = async ctx => {
	const dogId = ctx.params.id;
	const { breedId } = ctx.request.body;
	try {
		const dog = await dogModel.getById(dogId);
		if (dog) {
			const { role } = ctx.state.user;

			const permission = await can.dogBreed.set(role);
			if (!permission.granted) {
				ctx.status = 403;
				return;
			}
			const result = await dogBreedModel.add(dogId, breedId);
			if (result) {
				ctx.status = 201;
				ctx.body = { id: dogId, created: true, link: ctx.request.path };
			}
		}
	} catch (err) {
		ctx.status = 500;
		ctx.body = err;
	}
};

/**
 * Updates a dog's breed by the dog's ID and new breed ID.
 * @param {object} ctx context passed from Koa.
 */
const updateDogBreed = async ctx => {
	const dogId = ctx.params.id;
	const { breedId } = ctx.request.body;
	try {
		const dog = await dogModel.getById(dogId);
		if (dog) {
			const { id: userId, role } = ctx.state.user;
			const { locationId: userLoc } = (await staffModel.getByUserId(userId)) || {};
			const { locationId: dogLoc } = (await dogLocationModel.getByDogId(dogId)) || {};

			const permission = await can.dogBreed.modify(role, userLoc, dogLoc);
			if (!permission.granted) {
				ctx.status = 403;
				return;
			}
			const result = await dogBreedModel.update(dogId, breedId);
			if (result) ctx.body = { id: dogId, updated: true, link: ctx.request.path };
		}
	} catch (err) {
		ctx.status = 500;
		ctx.body = err;
	}
};

/**
 * Deletes a dog's breed from the database.
 * @param {object} ctx context passed from Koa.
 */
const deleteDogBreed = async ctx => {
	const dogId = ctx.params.id;
	try {
		const dog = await dogModel.getById(dogId);
		if (dog) {
			const { id: userId, role } = ctx.state.user;
			const { locationId: userLoc } = (await staffModel.getByUserId(userId)) || {};
			const { locationId: dogLoc } = (await dogLocationModel.getByDogId(dogId)) || {};

			const permission = await can.dog.delete(role, userLoc, dogLoc);
			if (!permission.granted) {
				ctx.status = 403;
				return;
			}
			const result = await dogBreedModel.delete(dogId);
			if (result) ctx.body = { id: dogId, deleted: true };
		}
	} catch (err) {
		ctx.status = 500;
		ctx.body = err;
	}
};

/**
 * Gets a dog's location by the dog's ID.
 * @param {object} ctx context passed from Koa.
 */
const getDogLocation = async ctx => {
	const dogId = ctx.params.id;
	try {
		const dogLocation = await dogLocationModel.getByDogId(dogId);
		if (dogLocation) ctx.body = dogLocation;
	} catch (err) {
		ctx.status = 500;
		ctx.body = err;
	}
};

/**
 * Sets a dog's location by the dog's ID and location ID.
 * @param {object} ctx context passed from Koa.
 */
const addDogLocation = async ctx => {
	const dogId = ctx.params.id;
	const { locationId } = ctx.request.body;
	try {
		const dog = await dogModel.getById(dogId);
		if (dog) {
			const { id: userId, role } = ctx.state.user;
			const { locationId: userLoc } = (await staffModel.getByUserId(userId)) || {};
			const { locationId: dogLoc } = (await dogLocationModel.getByDogId(dogId)) || {};

			const permission = await can.dog.delete(role, userLoc, dogLoc);
			if (!permission.granted) {
				ctx.status = 403;
				return;
			}
			const result = await dogLocationModel.add(dogId, locationId);
			if (result) {
				ctx.status = 201;
				ctx.body = { id: dogId, created: true, link: ctx.request.path };
			}
		}
	} catch (err) {
		ctx.status = 500;
		ctx.body = err;
	}
};

/**
 * Updates a dog's location by the dog's ID and new location ID.
 * @param {object} ctx context passed from Koa.
 */
const updateDogLocation = async ctx => {
	const dogId = ctx.params.id;
	const { locationId } = ctx.request.body;
	try {
		const dog = await dogModel.getById(dogId);
		if (dog) {
			const { id: userId, role } = ctx.state.user;
			const { locationId: userLoc } = (await staffModel.getByUserId(userId)) || {};
			const { locationId: dogLoc } = (await dogLocationModel.getByDogId(dogId)) || {};

			const permission = await can.dog.delete(role, userLoc, dogLoc);
			if (!permission.granted) {
				ctx.status = 403;
				return;
			}
			const result = await dogLocationModel.update(dogId, locationId);
			if (result) ctx.body = { id: dogId, updated: true, link: ctx.request.path };
		}
	} catch (err) {
		ctx.status = 500;
		ctx.body = err;
	}
};

/**
 * Deletes a dog's location from the database by dog ID.
 * @param {object} ctx context passed from Koa.
 */
const deleteDogLocation = async ctx => {
	const dogId = ctx.params.id;
	try {
		const dog = await dogModel.getById(dogId);
		if (dog) {
			const { id: userId, role } = ctx.state.user;
			const { locationId: userLoc } = (await staffModel.getByUserId(userId)) || {};
			const { locationId: dogLoc } = (await dogLocationModel.getByDogId(dogId)) || {};

			const permission = await can.dog.delete(role, userLoc, dogLoc);
			if (!permission.granted) {
				ctx.status = 403;
				return;
			}
			const result = await dogLocationModel.delete(dogId);
			if (result) ctx.body = { id: dogId, deleted: true };
		}
	} catch (err) {
		ctx.status = 500;
		ctx.body = err;
	}
};

/**
 * Gets the number of favourites a dog has.
 * @param {object} ctx context passed from Koa.
 */
const getFavourites = async ctx => {
	const id = ctx.params.id;
	try {
		const count = await favouritesModel.getFavCount(id);
		ctx.body = count;
	} catch (err) {
		ctx.status = 500;
		ctx.body = err;
	}
};

router.get('/', getAll);
router.post('/', auth, validateDog, addDog);

router.get('/:id([0-9]+)', getDog);
router.put('/:id([0-9]+)', auth, validateDog, updateDog);
router.del('/:id([0-9]+)', auth, deleteDog);

router.get('/:id([0-9]+)/breed', getDogBreed);
router.post('/:id([0-9]+)/breed', auth, validateDogBreed, addDogBreed);
router.put('/:id([0-9]+)/breed', auth, validateDogBreed, updateDogBreed);
router.del('/:id([0-9]+)/breed', auth, deleteDogBreed);

router.get('/:id([0-9]+)/location', getDogLocation);
router.post('/:id([0-9]+)/location', auth, validateDogLocation, addDogLocation);
router.put('/:id([0-9]+)/location', auth, validateDogLocation, updateDogLocation);
router.del('/:id([0-9]+)/location', auth, deleteDogLocation);

router.get('/:id([0-9]+)/favourites', getFavourites);

module.exports = router;
