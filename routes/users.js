const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');

const userModel = require('../models/users');
const favsModel = require('../models/favourites');

const router = new Router({ prefix: '/api/v1/users' });

router.get('/', getAll);
router.post('/', bodyParser(), createUser);

router.get('/:id([0-9]{1,})', getUser);
router.put('/:id([0-9]{1,})', bodyParser(), updateUser);
router.del('/:id([0-9]{1,})', deleteUser);

router.get('/:id([0-9]{1,})/favourites', getUserFavs);
router.post('/:id([0-9]{1,})/favourites', bodyParser(), addUserFav);

router.get('/:id([0-9]{1,})/favourites/:dogId', getUserFav);
router.del('/:id([0-9]{1,})/favourites/:dogId', deleteUserFav);

/**
 * Gets all the users from the database.
 */
async function getAll(ctx) {
    ctx.body = await userModel.getAll();
}

/**
 * Gets a single user from the database.
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
 */
async function updateUser(ctx) {
    const user_id = ctx.params.id;
    let user = await userModel.getById(user_id);
    if (user) {
        // Excluding fields that must not be updated
        const { id, dateCreated, ...body } = ctx.request.body;
        Object.assign(user, body); // overwriting everything else
        const result = await userModel.update(user_id, user);
        if (result) { // Knex returns amount of affected rows.
            ctx.body = { id: user_id, updated: true, link: ctx.request.path };
        }
    }
}

/**
 * Deletes a user from the database.
 */
async function deleteUser(ctx) {
    const id = ctx.params.id;
    let user = await userModel.getById(id);
    if (user) {
        const result = await userModel.delete(id);
        if (result) {
            ctx.status = 200;
        }
    }
}

async function getUserFavs(ctx) {
    const id = ctx.params.id;
    let favs = await favsModel.getByUserId(id);
    if (favs) {
        ctx.body = favs
    }
}

async function addUserFav(ctx) {
    const userId = ctx.params.id;
    const { dogId } = ctx.request.body;
    const result = await favsModel.add(userId, dogId);
    if (result === 0) { // 0 since add returns PK of inserted row
        ctx.status = 201;
    }
}

async function getUserFav(ctx) {
    const userId = ctx.params.id;
    const dogId = ctx.params.dogId;
    const result = await favsModel.getByDogId(userId, dogId);
    if (result) {
        ctx.body = result;
    }
}

async function deleteUserFav(ctx) {
    const userId = ctx.params.id;
    const dogId = ctx.params.dogId;
    const result = await favsModel.delete(userId, dogId);
    if (result) {
        ctx.status = 200;
    }
}

module.exports = router;