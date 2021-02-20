const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');

const userModel = require('../models/users');
const favsModel = require('../models/favourites');

const auth = require('../controllers/auth');

const router = new Router({ prefix: '/api/v1/users' });

router.get('/', auth, getAll);
router.post('/', bodyParser(), createUser);

router.get('/:id([0-9]{1,})', auth, getUser);
router.put('/:id([0-9]{1,})', auth, bodyParser(), updateUser);
router.del('/:id([0-9]{1,})', auth, deleteUser);

router.get('/:id([0-9]{1,})/favourites', auth, getUserFavs);
router.post('/:id([0-9]{1,})/favourites', auth, bodyParser(), addUserFav);

router.get('/:id([0-9]{1,})/favourites/:dogId([0-9]{1,})', auth, getUserFav);
router.del('/:id([0-9]{1,})/favourites/:dogId([0-9]{1,})', auth, deleteUserFav);

/**
 * Gets all the users from the database.
 * @param {object} ctx context passed from Koa.
 */
async function getAll(ctx) {
    ctx.body = await userModel.getAll();
}

/**
 * Gets a single user from the database.
 * @param {object} ctx context passed from Koa.
 */
async function getUser(ctx) {
    const id = ctx.params.id;
    const user = await userModel.getById(id);
    if (user) {
        ctx.body = user;
    }
}

/**
 * Adds a user to the database.
 * @param {object} ctx context passed from Koa.
 */
async function createUser(ctx) {
    const body = ctx.request.body;
    const id = await userModel.add(body);
    if (id) {
        ctx.status = 201;
        ctx.body = { ID: id, created: true, link: `${ctx.request.path}/${id}` };
    }
}

/**
 * Updates a user in the database.
 * @param {object} ctx context passed from Koa.
 */
async function updateUser(ctx) {
    const userId = ctx.params.id;
    let user = await userModel.getById(userId);
    if (user) {
        // Excluding fields that must not be updated
        const { id, dateCreated, ...body } = ctx.request.body;

        const result = await userModel.update(userId, body);

        // Knex returns amount of affected rows.
        if (result) {
            ctx.body = { id: userId, updated: true, link: ctx.request.path };
        };
    }
}

/**
 * Deletes a user from the database.
 * @param {object} ctx context passed from Koa.
 */
async function deleteUser(ctx) {
    const id = ctx.params.id;
    const user = await userModel.getById(id);
    if (user) {
        const result = await userModel.delete(id);
        if (result) {
            ctx.body = { id, deleted: true };
        }
    }
}

/**
 * Gets a user's favourites.
 * @param {object} ctx context passed from Koa.
 */
async function getUserFavs(ctx) {
    const id = ctx.params.id;
    const favourites = await favsModel.getByUserId(id);
    if (favourites) {
        ctx.body = favourites;
    }
}

/**
 * Adds a dog to a user's favourites by dog ID.
 * @param {object} ctx context passed from Koa.
 */
async function addUserFav(ctx) {
    const userId = ctx.params.id;
    const { dogId } = ctx.request.body;
    const result = await favsModel.add(userId, dogId);
    if (result) {
        ctx.status = 201;
        ctx.body = { id: userId, created: true, link: `${ctx.request.path}/${dogId}` };
    }
}

/**
 * Gets a user's favourite from the database by dog ID.
 * @param {object} ctx context passed from Koa.
 */
async function getUserFav(ctx) {
    const userId = ctx.params.id;
    const dogId = ctx.params.dogId;
    const result = await favsModel.getSingleFav(userId, dogId);
    if (result) {
        ctx.body = result;
    }
}

/**
 * Delete a user's favourite dog by ID.
 * @param {object} ctx context passed from Koa.
 */
async function deleteUserFav(ctx) {
    const userId = ctx.params.id;
    const dogId = ctx.params.dogId;
    const result = await favsModel.delete(userId, dogId);
    if (result) {
        ctx.body = { id: userId, deleted: true };
    }
}

module.exports = router;