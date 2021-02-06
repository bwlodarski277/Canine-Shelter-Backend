const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');

const router = new Router({ prefix: '/api/v1/breeds' });

let breeds = [
    {
        name: 'Shiba Inu',
        description: 'A breed of good bois.'
    }
]

/**
 * Creates a date string.
 */
async function getCurrentDate() {
    const now = new Date();
    const date = `${now.getDate()}/${now.getMonth()}/${now.getFullYear()}`;
    return date;
}

/**
 * Checks if an ID is valid.
 * @param {int} id ID to check
 */
const isValid = id => id < breeds.length + 1 && id > 0;

router.get('/', getAll);
router.post('/', bodyParser(), addBreed);

router.get('/:id([0-9]{1,})', getBreed);
router.put('/:id([0-9]{1,})', updateBreed);
router.del('/:id([0-9]{1,})', deleteBreed);

/**
 * Gets all the breeds from the database.
 */
async function getAll(ctx) {
    ctx.body = breeds;
}

/**
 * Gets a single breed from the database.
 */
async function getBreed(ctx) {
    const id = parseInt(ctx.params.id);
    if (isValid(id))
        ctx.body = breeds[id - 1];
    else
        ctx.status = 404;
}

/**
 * Adds a breed to the database.
 */
async function addBreed(ctx) {
    const { name, description } = ctx.request.body;
    const date = await getCurrentDate();
    // Creating a new breed
    let newBreed = { name, description };
    breeds.push(newBreed);
    ctx.status = 201;
    ctx.body = newBreed;
}

/**
 * Updates a breed in the database.
 */
async function updateBreed(ctx) {
    const id = parseInt(ctx.params.id);
    if (isValid(id)) {
        // Constructing updated breed
        const { name, description } = ctx.request.body;
        const updatedBreed = { name, description };

        ctx.body = updatedBreed;
    } else {
        ctx.status = 404;
    }
}

/**
 * Deletes a breed from the database.
 */
async function deleteBreed(ctx) {
    const id = parseInt(ctx.params.id);
    if (isValid(id)) {
        breeds.splice(id - 1, 1);
        ctx.status = 200;
    } else {
        ctx.status = 404;
    }
}

module.exports = router;