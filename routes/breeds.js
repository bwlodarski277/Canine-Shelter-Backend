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
const { ifModifiedSince, ifNoneMatch } = require('../helpers/caching');

const { validateBreed, validateBreedUpdate } = require('../controllers/validation');

const prefix = '/api/v1/breeds';
const router = new Router({ prefix });

router.use(bodyParser());

/**
 * Gets all the breeds from the database.
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
	// Clamping the limit to be between 1 and 20.
	limit = clamp(limit, 0, 20);
	// fixing direction to two values
	direction = direction === 'desc' ? 'desc' : 'asc';
	if (!Array.isArray(select)) select = Array(select);
	// Getting data
	let breeds = await breedModel.getAll(query, page, limit, order, direction);
	breeds = breeds.map(breed => {
		// Selecting fields the user wants
		const partial = { id: breed.id };
		select.map(field => (partial[field] = breed[field]));
		const self = `${ctx.protocol}://${ctx.host}${prefix}/${partial.id}`;
		partial.links = {
			self: self,
			dogs: `${self}/dogs`
		};
		return partial;
	});
	const count = await breedModel.getCount(query);
	ctx.body = { breeds, count };
	return next();
};

/**
 * Gets all the dogs from assigned to a breed.
 * @param {object} ctx context passed from Koa.
 */
const getDogs = async (ctx, next) => {
	const breedId = ctx.params.id;
	const breed = await breedModel.getById(breedId);
	if (breed) {
		let {
			query = '',
			select = [],
			page = 1,
			limit = 10,
			order = 'id',
			direction
		} = ctx.request.query;
		limit = clamp(limit, 1, 20);
		if (!Array.isArray(select)) select = Array(select);
		let dogs = await dogBreedModel.getByBreedId(breedId, query, page, limit, order, direction);
		dogs = dogs.map(dog => {
			const partial = { id: dog.dogId };
			select.map(field => (partial[field] = dog[field]));
			const self = `${ctx.protocol}://${ctx.host}/api/v1/dogs/${dog.dogId}`;
			partial.links = {
				self: self,
				breed: `${self}/breed`,
				location: `${self}/location`,
				favourites: `${self}/favourites`
			};
			return partial;
		});
		const count = await dogBreedModel.getCount(breedId, query);
		ctx.body = { dogs, count };
		return next();
	}
	ctx.status = 404;
	ctx.body = { message: 'Breed does not exist.' };
};

/**
 * Gets a single breed from the database by breed ID.
 * @param {object} ctx context passed from Koa.
 */
const getBreed = async (ctx, next) => {
	const breedId = ctx.params.id;
	let { select = [] } = ctx.request.query;
	if (!Array.isArray(select)) select = Array(select);
	const breed = await breedModel.getById(breedId);
	if (breed) {
		// Selecting fields the user wants
		let partial;
		// If nothing is selected, return everything
		if (select.length === 0) partial = breed;
		else {
			partial = { id: breed.id, modified: breed.modified };
			select.map(field => (partial[field] = breed[field]));
		}
		const self = `${ctx.protocol}://${ctx.host}${prefix}/${partial.id}`;
		partial.links = {
			self: self,
			dogs: `${self}/dogs`
		};
		ctx.body = partial;
		return next();
	}
	ctx.status = 404;
	ctx.body = { message: 'Breed does not exist.' };
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
	const body = ctx.request.body;
	const breedId = await breedModel.add(body);
	ctx.status = 201;
	ctx.body = {
		ID: breedId,
		created: true,
		link: `${ctx.protocol}://${ctx.host}${ctx.request.path}/${breedId}`
	};
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
	const breedId = ctx.params.id;
	const breed = await breedModel.getById(breedId);
	// Checking if breed exists
	if (breed) {
		const data = ctx.request.body;
		await breedModel.update(breedId, data);
		ctx.body = {
			id: breedId,
			updated: true,
			link: `${ctx.protocol}://${ctx.host}${ctx.request.path}`
		};
		return;
	}
	ctx.status = 404;
	ctx.body = { message: 'Breed does not exist.' };
};

/**
 * Deletes a breed from the database by breed ID.
 * @param {object} ctx context passed from Koa.
 */
const deleteBreed = async ctx => {
	const { role } = ctx.state.user;
	const permission = await can.delete(role);
	if (!permission.granted) {
		ctx.status = 403;
		return;
	}
	const breedId = ctx.params.id;
	const breed = await breedModel.getById(breedId);
	// Checking if breed exists
	if (breed) {
		await breedModel.delete(breedId);
		ctx.body = { id: breedId, deleted: true };
		return;
	}
	ctx.status = 404;
	ctx.body = { message: 'Breed does not exist.' };
};

router.get('/', getAll, ifNoneMatch);
router.post('/', auth, validateBreed, addBreed);

router.get('/:id([0-9]+)', getBreed, ifModifiedSince);
router.put('/:id([0-9]+)', auth, validateBreedUpdate, updateBreed);
router.del('/:id([0-9]+)', auth, deleteBreed);

router.get('/:id([0-9]+)/dogs', getDogs, ifNoneMatch);

module.exports = router;
