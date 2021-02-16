const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');

const model = require('../models/breeds');

const router = new Router({ prefix: '/api/v1/breeds' });

router.get('/', getAll);
router.post('/', bodyParser(), addBreed);

router.get('/:id([0-9]{1,})', getBreed);
router.put('/:id([0-9]{1,})', bodyParser(), updateBreed);
router.del('/:id([0-9]{1,})', deleteBreed);

/**
 * Gets all the breeds from the database.
 */
async function getAll(ctx) {
    ctx.body = await model.getAll();
}

/**
 * Gets a single breed from the database.
 */
async function getBreed(ctx) {
    const id = ctx.params.id;
    ctx.body = await model.getById(id);
}

/**
 * Adds a breed to the database.
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
 * Updates a breed in the database.
 */
async function updateBreed(ctx) {
    const breed_id = ctx.params.id;
    let breed = await model.getById(breed_id);
    if (breed) {
        // Excluding fields that must not be updated
        const { id, ...body } = ctx.request.body;
        Object.assign(breed, body); // overwriting everything else
        const result = await model.update(breed_id, breed);
        if (result) { // Knex returns amount of affected rows.
            ctx.body = { id: breed_id, updated: true, link: ctx.request.path };
        }
    }
}

/**
 * Deletes a breed from the database.
 */
async function deleteBreed(ctx) {
    const id = ctx.params.id;
    let breed = await model.getById(id);
    if (breed) {
        const result = await model.delete(id);
        if (result) {
            ctx.status = 200;
        }
    }
}

module.exports = router;