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

const {
	validateDog,
	validateDogBreed,
	validateDogLocation
} = require('../controllers/validation');

const { auth } = require('../controllers/auth');

const router = new Router({ prefix: '/api/v1/dogs' });

router.get('/', getAll);
router.post('/', auth, bodyParser(), validateDog, addDog);

router.get('/:id([0-9]+)', getDog);
router.put('/:id([0-9]+)', auth, bodyParser(), validateDog, updateDog);
router.del('/:id([0-9]+)', auth, deleteDog);

router.get('/:id([0-9]+)/breed', getDogBreed);
router.post(
	'/:id([0-9]+)/breed',
	auth,
	bodyParser(),
	validateDogBreed,
	addDogBreed
);
router.put(
	'/:id([0-9]+)/breed',
	auth,
	bodyParser(),
	validateDogBreed,
	updateDogBreed
);
router.del('/:id([0-9]+)/breed', auth, deleteDogBreed);

router.get('/:id([0-9]+)/location', getDogLocation);
router.post(
	'/:id([0-9]+)/location',
	auth,
	bodyParser(),
	validateDogLocation,
	addDogLocation
);
router.put(
	'/:id([0-9]+)/location',
	auth,
	bodyParser(),
	validateDogLocation,
	updateDogLocation
);
router.del('/:id([0-9]+)/location', auth, deleteDogLocation);

router.get('/:id([0-9]+)/favourites', getFavourites);

/**
 * Gets all the dogs from the database.
 * @param {object} ctx context passed from Koa.
 */
async function getAll(ctx) {
	const { query, page, limit, order, direction } = ctx.request.query;
	const dogs = await dogModel.getAll(query, page, limit, order, direction);
	if (dogs.length) {
		ctx.body = dogs;
	}
}

/**
 * Gets a single dog from the database by ID.
 * @param {object} ctx context passed from Koa.
 */
async function getDog(ctx) {
	const id = ctx.params.id;
	const dog = await dogModel.getById(id);
	if (dog) {
		ctx.body = dog;
	}
}

/**
 * Adds a dog to the database.
 * @param {object} ctx context passed from Koa.
 */
async function addDog(ctx) {
	const body = ctx.request.body;
	const id = await dogModel.add(body);
	if (id) {
		ctx.status = 201;
		ctx.body = { ID: id, created: true, link: `${ctx.request.path}/${id}` };
	}
}

/**
 * Updates a dog in the database by ID.
 * @param {object} ctx context passed from Koa.
 */
async function updateDog(ctx) {
	const dogId = ctx.params.id;
	let dog = await dogModel.getById(dogId);
	if (dog) {
		// Excluding fields that must not be updated
		const { id, dateCreated, dateModified, ...body } = ctx.request.body;

		const result = await dogModel.update(dogId, body);

		// Knex returns amount of affected rows.
		if (result) {
			ctx.status = 201;
			ctx.body = { id: dogId, updated: true, link: ctx.request.path };
		}
	}
}

/**
 * Deletes a dog from the database by ID.
 * @param {object} ctx context passed from Koa.
 */
async function deleteDog(ctx) {
	const id = ctx.params.id;
	const dog = await dogModel.getById(id);
	if (dog) {
		const result = await dogModel.delete(id);
		if (result) {
			ctx.stbody = { id, deleted: true };
		}
	}
}

/**
 * Gets a dog's breed by the dog ID.
 * @param {object} ctx context passed from Koa.
 */
async function getDogBreed(ctx) {
	const id = ctx.params.id;
	const dogBreed = await dogBreedModel.getByDogId(id);
	if (dogBreed) {
		ctx.body = dogBreed;
	}
}

/**
 * Sets a dog's breed by the dog's ID and breed ID.
 * @param {object} ctx context passed from Koa.
 */
async function addDogBreed(ctx) {
	const dogId = ctx.params.id;
	const { breedId } = ctx.request.body;
	const result = await dogBreedModel.add(dogId, breedId);
	if (result) {
		ctx.status = 201;
		ctx.body = { id: dogId, created: true, link: ctx.request.path };
	}
}

/**
 * Updates a dog's breed by the dog's ID and new breed ID.
 * @param {object} ctx context passed from Koa.
 */
async function updateDogBreed(ctx) {
	const dogId = ctx.params.id;
	const { breedId } = ctx.request.body;
	const result = await dogBreedModel.update(dogId, breedId);
	if (result) {
		ctx.body = { id: dogId, updated: true, link: ctx.request.path };
	}
}

/**
 * Deletes a dog's breed from the database.
 * @param {object} ctx context passed from Koa.
 */
async function deleteDogBreed(ctx) {
	const dogId = ctx.params.id;
	const result = await dogBreedModel.delete(dogId);
	if (result) {
		ctx.body = { id: dogId, deleted: true };
	}
}

/**
 * Gets a dog's location by the dog's ID.
 * @param {object} ctx context passed from Koa.
 */
async function getDogLocation(ctx) {
	const id = ctx.params.id;
	const dogLocation = await dogLocationModel.getByDogId(id);
	if (dogLocation) {
		ctx.body = dogLocation;
	}
}

/**
 * Sets a dog's location by the dog's ID and location ID.
 * @param {object} ctx context passed from Koa.
 */
async function addDogLocation(ctx) {
	const dogId = ctx.params.id;
	const { locationId } = ctx.request.body;
	const result = await dogLocationModel.add(dogId, locationId);
	if (result) {
		ctx.status = 201;
		ctx.body = { id: dogId, created: true, link: ctx.request.path };
	}
}

/**
 * Updates a dog's location by the dog's ID and new location ID.
 * @param {object} ctx context passed from Koa.
 */
async function updateDogLocation(ctx) {
	const dogId = ctx.params.id;
	const { locationId } = ctx.request.body;
	const result = await dogLocationModel.update(dogId, locationId);
	if (result) {
		ctx.body = { id: dogId, updated: true, link: ctx.request.path };
	}
}

/**
 * Deletes a dog's location from the database by dog ID.
 * @param {object} ctx context passed from Koa.
 */
async function deleteDogLocation(ctx) {
	const dogId = ctx.params.id;
	const result = await dogLocationModel.delete(dogId);
	if (result) {
		ctx.body = { id: dogId, deleted: true };
	}
}

/**
 * Gets the number of favourites a dog has.
 * @param {object} ctx context passed from Koa.
 */
async function getFavourites(ctx) {
	const id = ctx.params.id;
	const count = await favouritesModel.getFavCount(id);
	ctx.body = count;
}

module.exports = router;
