const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');

const model = require('../models/locations');

const router = new Router({ prefix: '/api/v1/locations' });

router.get('/', getAll);
router.post('/', bodyParser(), addLocation);

router.get('/:id([0-9]{1,})', getLocation);
router.put('/:id([0-9]{1,})', bodyParser(), updateLocation);
router.del('/:id([0-9]{1,})', deleteLocation);

/**
 * Gets all the locations from the database.
 * @param {object} ctx context passed from Koa.
 */
async function getAll(ctx) {
    ctx.body = await model.getAll();
}

/**
 * Gets a single location from the database by ID.
 * @param {object} ctx context passed from Koa.
 */
async function getLocation(ctx) {
    const id = ctx.params.id;
    ctx.body = await model.getById(id);
}

/**
 * Adds a location to the database.
 * @param {object} ctx context passed from Koa.
 */
async function addLocation(ctx) {
    const body = ctx.request.body;
    const id = await model.add(body);
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
    const location_id = ctx.params.id;
    let location = await model.getById(location_id);
    if (location) {
        // Excluding fields that must not be updated
        const { id, ...body } = ctx.request.body;
        Object.assign(location, body); // overwriting everything else
        const result = await model.update(location_id, location);
        if (result) { // Knex returns amount of affected rows.
            ctx.body = { id: location_id, updated: true, link: ctx.request.path };
        }
    }
}

/**
 * Deletes a location from the database by ID.
 * @param {object} ctx context passed from Koa.
 */
async function deleteLocation(ctx) {
    const id = ctx.params.id;
    let location = await model.getById(id);
    if (location) {
        const result = await model.delete(id);
        if (result) {
            ctx.status = 200;
        }
    }
}

module.exports = router;