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

const {
	validateDog,
	validateDogUpdate,
	validateDogBreed,
	validateDogLocation
} = require('../controllers/validation');
const can = require('../permissions/dogs');

const { auth } = require('../controllers/auth');
const { clamp } = require('../helpers/utils');
const { ifModifiedSince, ifNoneMatch } = require('../helpers/caching');

const prefix = '/api/v1/dogs';
const router = new Router({ prefix });

router.use(bodyParser());

/**
 * Gets all the dogs from the database.
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
	limit = clamp(limit, 1, 20);
	// Fixing direction to two values
	direction = direction === 'desc' ? 'desc' : 'asc';
	if (!Array.isArray(select)) select = Array(select);
	let dogs = await dogModel.getAll(query, page, limit, order, direction);
	dogs = dogs.map(dog => {
		// Selecting fields the user wants
		const partial = { id: dog.id };
		select.map(field => (partial[field] = dog[field]));
		const self = `${ctx.protocol}://${ctx.host}${prefix}/${partial.id}`;
		partial.links = {
			self: self,
			breed: `${self}/breed`,
			location: `${self}/location`,
			favourites: `${self}/favourites`
		};
		return partial;
	});
	ctx.body = dogs;
	return next();
};

/**
 * Gets a single dog from the database by ID.
 * @param {object} ctx Koa object passed by previous middleware
 * @param {function} next next function to call in the middleware chain
 */
const getDog = async (ctx, next) => {
	const id = ctx.params.id;
	let { select = [] } = ctx.request.query;
	if (!Array.isArray(select)) select = Array(select);
	const dog = await dogModel.getById(id, select);
	if (dog) {
		let partial;
		// If nothing is selected, return everything
		if (select.length === 0) partial = dog;
		else {
			partial = { id: dog.id, modified: dog.modified };
			select.map(field => (partial[field] = dog[field]));
		}
		const self = `${ctx.protocol}://${ctx.host}${prefix}/${id}`;
		partial.links = {
			self: self,
			breed: `${self}/breed`,
			location: `${self}/location`,
			favourites: `${self}/favourites`
		};
		ctx.body = partial;
		return next();
	}
	ctx.status = 404;
	ctx.body = { message: 'Dog does not exist.' };
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
	const id = await dogModel.add(body);
	ctx.status = 201;
	ctx.body = {
		id,
		created: true,
		link: `${ctx.protocol}://${ctx.host}${ctx.request.path}/${id}`
	};
};

/**
 * Updates a dog in the database by ID.
 * @param {object} ctx context passed from Koa.
 */
const updateDog = async ctx => {
	const dogId = parseInt(ctx.params.id);
	const dog = await dogModel.getById(dogId);
	// Checking if dog exists
	if (dog) {
		const { id: userId, role } = ctx.state.user;
		// Making sure userLoc and dogLoc don't throw an error if nothing returned
		const { locationId: userLoc } = (await staffModel.getByUserId(userId)) || {};
		const { locationId: dogLoc } = (await dogLocationModel.getByDogId(dogId)) || {};
		// If a user is a staff member
		const permission = await can.dog.modify(role, userLoc, dogLoc);
		if (!permission.granted) {
			ctx.status = 403;
			return;
		}
		const { body } = ctx.request;
		await dogModel.update(dogId, body);
		ctx.status = 200;
		ctx.body = {
			id: dogId,
			updated: true,
			link: `${ctx.protocol}://${ctx.host}${ctx.request.path}`
		};
		return;
	}
	ctx.status = 404;
	ctx.body = { message: 'Dog does not exist.' };
};

/**
 * Deletes a dog from the database by ID.
 * @param {object} ctx context passed from Koa.
 */
const deleteDog = async ctx => {
	const dogId = parseInt(ctx.params.id);
	const dog = await dogModel.getById(dogId);
	if (dog) {
		const { id: userId, role } = ctx.state.user;
		// Making sure userLoc and dogLoc don't throw an error if nothing returned
		const { locationId: userLoc } = (await staffModel.getByUserId(userId)) || {};
		const { locationId: dogLoc } = (await dogLocationModel.getByDogId(dogId)) || {};

		const permission = await can.dog.delete(role, userLoc, dogLoc);
		if (!permission.granted) {
			ctx.status = 403;
			return;
		}
		await dogModel.delete(dogId);
		ctx.body = { id: dogId, deleted: true };
		return;
	}
	ctx.status = 404;
	ctx.body = { message: 'Dog does not exist.' };
};

/**
 * Gets a dog's breed by the dog ID.
 * @param {object} ctx Koa object passed by previous middleware
 * @param {function} next next function to call in the middleware chain
 */
const getDogBreed = async (ctx, next) => {
	const id = ctx.params.id;
	const dogBreed = await dogBreedModel.getByDogId(id);
	if (dogBreed) {
		const breed = `${ctx.protocol}://${ctx.host}/api/v1/breeds/${dogBreed.breedId}`;
		dogBreed.links = { breed };
		ctx.body = dogBreed;
		return next();
	}
	ctx.status = 404;
	ctx.body = { message: 'Dog does have breed assigned.' };
};

/**
 * Sets a dog's breed by the dog's ID and breed ID.
 * @param {object} ctx context passed from Koa.
 */
const addDogBreed = async ctx => {
	const dogId = ctx.params.id;
	const { breedId } = ctx.request.body;
	const dog = await dogModel.getById(dogId);
	if (dog) {
		const dogBreed = await dogBreedModel.getByDogId(dogId);
		if (dogBreed) {
			ctx.status = 400;
			ctx.body = { message: 'Dog already has a breed.' };
			return;
		}
		const { role } = ctx.state.user;
		const permission = await can.dogBreed.set(role);
		if (!permission.granted) {
			ctx.status = 403;
			return;
		}
		await dogBreedModel.add(dogId, breedId);
		ctx.status = 201;
		ctx.body = {
			id: dogId,
			created: true,
			link: `${ctx.protocol}://${ctx.host}${ctx.request.path}`
		};
		return;
	}
	ctx.status = 404;
	ctx.body = { message: 'Dog does not exist.' };
};

/**
 * Updates a dog's breed by the dog's ID and new breed ID.
 * @param {object} ctx context passed from Koa.
 */
const updateDogBreed = async ctx => {
	const dogId = ctx.params.id;
	const { breedId } = ctx.request.body;
	const dog = await dogModel.getById(dogId);
	if (dog) {
		const { id: userId, role } = ctx.state.user;
		// Making sure userLoc and dogLoc don't throw an error if nothing returned
		const { locationId: userLoc } = (await staffModel.getByUserId(userId)) || {};
		const { locationId: dogLoc } = (await dogLocationModel.getByDogId(dogId)) || {};

		const permission = await can.dogBreed.modify(role, userLoc, dogLoc);
		if (!permission.granted) {
			ctx.status = 403;
			return;
		}
		await dogBreedModel.update(dogId, breedId);
		ctx.body = {
			id: dogId,
			updated: true,
			link: `${ctx.protocol}://${ctx.host}${ctx.request.path}`
		};
		return;
	}
	ctx.status = 404;
	ctx.body = { message: 'Dog does not exist.' };
};

/**
 * Deletes a dog's breed from the database.
 * @param {object} ctx context passed from Koa.
 */
const deleteDogBreed = async ctx => {
	const dogId = parseInt(ctx.params.id);
	const dog = await dogModel.getById(dogId);
	if (dog) {
		const { id: userId, role } = ctx.state.user;
		// Making sure userLoc and dogLoc don't throw an error if nothing returned
		const { locationId: userLoc } = (await staffModel.getByUserId(userId)) || {};
		const { locationId: dogLoc } = (await dogLocationModel.getByDogId(dogId)) || {};

		const permission = await can.dogBreed.delete(role, userLoc, dogLoc);
		if (!permission.granted) {
			ctx.status = 403;
			return;
		}

		const dogBreed = await dogBreedModel.getByDogId(dogId);
		if (!dogBreed) {
			ctx.status = 400;
			ctx.body = { message: 'Dog does not have a breed assigned.' };
			return;
		}
		await dogBreedModel.delete(dogId);
		ctx.body = { id: dogId, deleted: true };
		return;
	}
	ctx.status = 404;
	ctx.body = { message: 'Dog does not exist.' };
};

/**
 * Gets a dog's location by the dog's ID.
 * @param {object} ctx Koa object passed by previous middleware
 * @param {function} next next function to call in the middleware chain
 */
const getDogLocation = async (ctx, next) => {
	const dogId = ctx.params.id;
	const dogLocation = await dogLocationModel.getByDogId(dogId);
	if (dogLocation) {
		const location = `${ctx.protocol}://${ctx.host}/api/v1/locations/${dogLocation.locationId}`;
		dogLocation.links = { location };
		ctx.body = dogLocation;
		return next();
	}
	ctx.status = 404;
	ctx.body = { message: 'Dog does not have a location.' };
};

/**
 * Sets a dog's location by the dog's ID and location ID.
 * @param {object} ctx context passed from Koa.
 */
const addDogLocation = async ctx => {
	const dogId = ctx.params.id;
	const { locationId } = ctx.request.body;
	const dog = await dogModel.getById(dogId);
	if (dog) {
		const { role } = ctx.state.user;

		const dogLocation = await dogLocationModel.getByDogId(dogId);
		if (dogLocation) {
			ctx.status = 400;
			ctx.body = { message: 'Dog already has a location.' };
			return;
		}

		const permission = await can.dogLocation.set(role);
		if (!permission.granted) {
			ctx.status = 403;
			return;
		}

		await dogLocationModel.add(dogId, locationId);
		ctx.status = 201;
		ctx.body = {
			id: dogId,
			created: true,
			link: `${ctx.protocol}://${ctx.host}${ctx.request.path}`
		};
		return;
	}
	ctx.status = 404;
	ctx.body = { message: 'Dog does not exist.' };
};

/**
 * Updates a dog's location by the dog's ID and new location ID.
 * @param {object} ctx context passed from Koa.
 */
const updateDogLocation = async ctx => {
	const dogId = parseInt(ctx.params.id);
	const { locationId } = ctx.request.body;
	const dog = await dogModel.getById(dogId);
	if (dog) {
		const { id: userId, role } = ctx.state.user;
		// Making sure userLoc and dogLoc don't throw an error if nothing returned
		const { locationId: userLoc } = (await staffModel.getByUserId(userId)) || {};
		const { locationId: dogLoc } = (await dogLocationModel.getByDogId(dogId)) || {};

		const permission = await can.dogLocation.modify(role, userLoc, dogLoc);
		if (!permission.granted) {
			ctx.status = 403;
			return;
		}
		await dogLocationModel.update(dogId, locationId);
		ctx.body = {
			id: dogId,
			updated: true,
			link: `${ctx.protocol}://${ctx.host}${ctx.request.path}`
		};
		return;
	}
	ctx.status = 404;
	ctx.body = { message: 'Dog does not exist.' };
};

/**
 * Deletes a dog's location from the database by dog ID.
 * @param {object} ctx context passed from Koa.
 */
const deleteDogLocation = async ctx => {
	const dogId = ctx.params.id;
	const dog = await dogModel.getById(dogId);
	if (dog) {
		const { id: userId, role } = ctx.state.user;
		// Making sure userLoc and dogLoc don't throw an error if nothing returned
		const { locationId: userLoc } = (await staffModel.getByUserId(userId)) || {};
		const { locationId: dogLoc } = (await dogLocationModel.getByDogId(dogId)) || {};

		const permission = await can.dogLocation.delete(role, userLoc, dogLoc);
		if (!permission.granted) {
			ctx.status = 403;
			return;
		}

		if (!dogLoc) {
			ctx.status = 400;
			ctx.body = { message: 'Dog does not have a location.' };
			return;
		}

		await dogLocationModel.delete(dogId);
		ctx.body = { id: dogId, deleted: true };
		return;
	}
	ctx.status = 404;
	ctx.body = { message: 'Dog does not exist.' };
};

/**
 * Gets the number of favourites a dog has.
 * @param {object} ctx context passed from Koa.
 */
const getFavourites = async (ctx, next) => {
	const id = ctx.params.id;
	const dog = await dogModel.getById(id);
	if (dog) {
		const count = await favouritesModel.getFavCount(id);
		ctx.body = { count };
		return next();
	}
	ctx.status = 404;
	ctx.body = { message: 'Dog does not exist.' };
};

router.get('/', getAll, ifNoneMatch);
router.post('/', auth, validateDog, addDog);

router.get('/:id([0-9]+)', getDog, ifModifiedSince);
router.put('/:id([0-9]+)', auth, validateDogUpdate, updateDog);
router.del('/:id([0-9]+)', auth, deleteDog);

router.get('/:id([0-9]+)/breed', getDogBreed, ifModifiedSince);
router.post('/:id([0-9]+)/breed', auth, validateDogBreed, addDogBreed);
router.put('/:id([0-9]+)/breed', auth, validateDogBreed, updateDogBreed);
router.del('/:id([0-9]+)/breed', auth, deleteDogBreed);

router.get('/:id([0-9]+)/location', getDogLocation, ifModifiedSince);
router.post('/:id([0-9]+)/location', auth, validateDogLocation, addDogLocation);
router.put('/:id([0-9]+)/location', auth, validateDogLocation, updateDogLocation);
router.del('/:id([0-9]+)/location', auth, deleteDogLocation);

router.get('/:id([0-9]+)/favourites', getFavourites, ifNoneMatch);

module.exports = router;
