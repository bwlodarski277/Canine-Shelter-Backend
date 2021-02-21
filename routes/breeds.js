const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');

const model = require('../models/breeds');

const auth = require('../controllers/auth');

const router = new Router({ prefix: '/api/v1/breeds' });

router.get('/', getAll);
router.post('/', auth, bodyParser(), addBreed);

router.get('/:id([0-9]+)', getBreed);
router.put('/:id([0-9]+)', auth, bodyParser(), updateBreed);
router.del('/:id([0-9]+)', auth, deleteBreed);

/**
 * Gets all the breeds from the database.
 * @param {object} ctx context passed from Koa.
 */
async function getAll(ctx) {
    ctx.body = await model.getAll();
}

/**
 * Gets a single breed from the database by breed ID.
 * @param {object} ctx context passed from Koa.
 */
async function getBreed(ctx) {
    const id = ctx.params.id;
    const breed = await model.getById(id);
    if (breed) {
        ctx.body = breed;
    }
}

/**
 * Adds a breed to the database.
 * @param {object} ctx context passed from Koa.
 */
async function addBreed(ctx) {
    const body = ctx.request.body;
    const id = await model.add(body);
    if (id) {
        ctx.status = 201;
        ctx.body = { ID: id, created: true, link: `${ctx.request.path}/${id}` };
    }
}

/**
 * Updates a breed in the database by breed ID.
 * @param {object} ctx context passed from Koa.
 */
async function updateBreed(ctx) {
    const breedId = ctx.params.id;
    let breed = await model.getById(breedId);
    if (breed) {
        // Excluding fields that must not be updated
        const { id, ...body } = ctx.request.body;

        const result = await model.update(breedId, body);

        if (result) { // Knex returns amount of affected rows.
            ctx.body = { id: breedId, updated: true, link: ctx.request.path };
        }
    }
}

/**
 * Deletes a breed from the database by breed ID.
 * @param {object} ctx context passed from Koa.
 */
async function deleteBreed(ctx) {
    const id = ctx.params.id;
    let breed = await model.getById(id);
    if (breed) {
        const result = await model.delete(id);
        if (result) {
            ctx.body = { id, deleted: true };
        }
    }
}

module.exports = router;