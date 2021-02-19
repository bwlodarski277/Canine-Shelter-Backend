const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');

const dogModel = require('../models/dogs');
const dogBreedModel = require('../models/dogBreeds');
const dogLocationModel = require('../models/dogLocations');

const router = new Router({ prefix: '/api/v1/dogs' });

router.get('/', getAll);
router.post('/', bodyParser(), addDog);

router.get('/:id([0-9]{1,})', getDog);
router.put('/:id([0-9]{1,})', bodyParser(), updateDog);
router.del('/:id([0-9]{1,})', deleteDog);

router.get('/:id([0-9]{1,})/breed', getDogBreed);
router.post('/:id([0-9]{1,})/breed', bodyParser(), addDogBreed);
router.put('/:id([0-9]{1,})/breed', bodyParser(), updateDogBreed);
router.del('/:id([0-9]{1,})/breed', deleteDogBreed);

router.get('/:id([0-9]{1,})/location', getDogLocation);
router.post('/:id([0-9]{1,})/location', bodyParser(), addDogLocation);
router.put('/:id([0-9]{1,})/location', bodyParser(), updateDogLocation);
router.del('/:id([0-9]{1,})/location', deleteDogLocation);

/**
 * Gets all the dogs from the database.
 * @param {object} ctx context passed from Koa.
 */
async function getAll(ctx) {
    ctx.body = await dogModel.getAll();
}

/**
 * Gets a single dog from the database by ID.
 * @param {object} ctx context passed from Koa.
 */
async function getDog(ctx) {
    const id = ctx.params.id;
    ctx.body = await dogModel.getById(id);
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
    const dog_id = ctx.params.id;
    let dog = await dogModel.getById(dog_id);
    if (dog) {
        // Excluding fields that must not be updated
        const { id, dateCreated, dateModified, ...body } = ctx.request.body;
        Object.assign(dog, body); // overwriting everything else
        const result = await dogModel.update(dog_id, dog);
        if (result) { // Knex returns amount of affected rows.
            ctx.body = { id: dog_id, updated: true, link: ctx.request.path };
        }
    }
}

/**
 * Deletes a dog from the database by ID.
 * @param {object} ctx context passed from Koa.
 */
async function deleteDog(ctx) {
    const id = ctx.params.id;
    let dog = await dogModel.getById(id);
    if (dog) {
        const result = await dogModel.delete(id);
        if (result) {
            ctx.status = 200;
        }
    }
}

/**
 * Gets a dog's breed by the dog ID.
 * @param {object} ctx context passed from Koa.
 */
async function getDogBreed(ctx) {
    const id = ctx.params.id;
    let dogBreed = await dogBreedModel.getByDogId(id);
    ctx.body = dogBreed
}

/**
 * Sets a dog's breed by the dog's ID and breed ID.
 * @param {object} ctx context passed from Koa.
 */
async function addDogBreed(ctx) {
    const dogId = ctx.params.id;
    const { breedId } = ctx.request.body;
    const result = await dogBreedModel.add(dogId, breedId);
    if (result === 0) { // 0 as add function returns PK of inserted row
        ctx.status = 201;
    }
}

/**
 * Updates a dog's breed by the dog's ID and new breed ID.
 * @param {object} ctx context passed from Koa.
 */
async function updateDogBreed(ctx) {
    const dogId = ctx.params.id;
    const { breedId } = ctx.request.body;
    let id = await dogBreedModel.update(dogId, breedId);
    if (id) {
        ctx.status = 200;
    }
}

/**
 * Deletes a dog's breed from the database.
 * @param {object} ctx context passed from Koa.
 */
async function deleteDogBreed(ctx) {
    const dogId = ctx.params.id;
    let id = await dogBreedModel.delete(dogId);
    if (id) {
        ctx.status = 200;
    }
}

/**
 * Gets a dog's location by the dog's ID.
 * @param {object} ctx context passed from Koa.
 */
async function getDogLocation(ctx) {
    const id = ctx.params.id;
    let dogLocation = await dogLocationModel.getByDogId(id);
    ctx.body = dogLocation
}

/**
 * Sets a dog's location by the dog's ID and location ID.
 * @param {object} ctx context passed from Koa.
 */
async function addDogLocation(ctx) {
    const dogId = ctx.params.id;
    const { locationId } = ctx.request.body;
    const result = await dogLocationModel.add(dogId, locationId);
    if (result === 0) { // 0 as add function returns PK of inserted row
        ctx.status = 201;
    }
}

/**
 * Updates a dog's location by the dog's ID and new location ID.
 * @param {object} ctx context passed from Koa.
 */
async function updateDogLocation(ctx) {
    const dogId = ctx.params.id;
    const { locationId } = ctx.request.body;
    let id = await dogLocationModel.update(dogId, locationId);
    if (id) {
        ctx.status = 200;
    }
}

/**
 * Deletes a dog's location from the database by dog ID.
 * @param {object} ctx context passed from Koa.
 */
async function deleteDogLocation(ctx) {
    const dogId = ctx.params.id;
    let id = await dogLocationModel.delete(dogId);
    if (id) {
        ctx.status = 200;
    }
}

module.exports = router;