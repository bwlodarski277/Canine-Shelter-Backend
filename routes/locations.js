const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');

const locationsModel = require('../models/locations');
const dogLocationsModel = require('../models/dogLocations');

const auth = require('../controllers/auth');

const router = new Router({ prefix: '/api/v1/locations' });

router.get('/', getAll);
router.post('/', auth, bodyParser(), addLocation);

router.get('/:id([0-9]+)', getLocation);
router.put('/:id([0-9]+)', auth, bodyParser(), updateLocation);
router.del('/:id([0-9]+)', auth, deleteLocation);

router.get('/:id([0-9]+)/dogs', getLocationDogs);

/**
 * Gets all the locations from the database.
 * @param {object} ctx context passed from Koa.
 */
async function getAll(ctx) {
    ctx.body = await locationsModel.getAll();
}

/**
 * Gets a single location from the database by ID.
 * @param {object} ctx context passed from Koa.
 */
async function getLocation(ctx) {
    const id = ctx.params.id;
    const location = await locationsModel.getById(id);
    if (location) {
        ctx.body = location;
    }
}

/**
 * Adds a location to the database.
 * @param {object} ctx context passed from Koa.
 */
async function addLocation(ctx) {
    const body = ctx.request.body;
    const id = await locationsModel.add(body);
    if (id) {
        ctx.status = 201;
        ctx.body = { ID: id, created: true, link: `${ctx.request.path}/${id}` };
    }
}

/**
 * Updates a location in the database by ID.
 * @param {object} ctx context passed from Koa.
 */
async function updateLocation(ctx) {
    const locationId = ctx.params.id;
    let location = await locationsModel.getById(locationId);
    if (location) {
        // Excluding fields that must not be updated
        const { id, ...body } = ctx.request.body;

        const result = await locationsModel.update(locationId, body);

        // Knex returns amount of affected rows.
        if (result) {
            ctx.body = { id: locationId, updated: true, link: ctx.request.path };
        }
    }
}

/**
 * Deletes a location from the database by ID.
 * @param {object} ctx context passed from Koa.
 */
async function deleteLocation(ctx) {
    const id = ctx.params.id;
    let location = await locationsModel.getById(id);
    if (location) {
        const result = await locationsModel.delete(id);
        if (result) {
            ctx.body = { id, deleted: true };
        }
    }
}

/**
 * Gets all the dogs at a location by ID..
 * @param {object} ctx context passed from Koa.
 */
async function getLocationDogs(ctx) {
    const id = ctx.params.id;
    const locationDogs = await dogLocationsModel.getByLocationId(id);
    if (locationDogs) {
        ctx.body = locationDogs;
    }
}

module.exports = router;