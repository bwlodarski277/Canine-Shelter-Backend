const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');

const router = new Router({ prefix: '/api/v1/locations' });

let locations = [
    {
        name: 'Coventry Location',
        address: 'Some place, Some City, etc.',
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
const isValid = id => id < locations.length + 1 && id > 0;

router.get('/', getAll);
router.post('/', bodyParser(), addLocation);

router.get('/:id([0-9]{1,})', getLocation);
router.put('/:id([0-9]{1,})', updateLocation);
router.del('/:id([0-9]{1,})', deleteLocation);

/**
 * Gets all the locations from the database.
 */
async function getAll(ctx) {
    ctx.body = locations;
}

/**
 * Gets a single location from the database.
 */
async function getLocation(ctx) {
    const id = parseInt(ctx.params.id);
    if (isValid(id))
        ctx.body = locations[id - 1];
    else
        ctx.status = 404;
}

/**
 * Adds a location to the database.
 */
async function addLocation(ctx) {
    const { name, address } = ctx.request.body;
    // Creating a new location
    let newLocation = { name, address };
    locations.push(newLocation);
    ctx.status = 201;
    ctx.body = newLocation;
}

/**
 * Updates a location in the database.
 */
async function updateLocation(ctx) {
    const id = parseInt(ctx.params.id);
    if (isValid(id)) {
        // Constructing updated location
        const { name, address } = ctx.request.body;
        const updatedLocation = { name, address };

        ctx.body = updatedLocation;
    } else {
        ctx.status = 404;
    }
}

/**
 * Deletes a location from the database.
 */
async function deleteLocation(ctx) {
    const id = parseInt(ctx.params.id);
    if (isValid(id)) {
        locations.splice(id - 1, 1);
        ctx.status = 200;
    } else {
        ctx.status = 404;
    }
}

module.exports = router;