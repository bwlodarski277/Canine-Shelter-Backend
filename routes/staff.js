const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');

const staffModel = require('../models/staff');

const auth = require('../controllers/auth');
const { config } = require('../config');

const router = new Router({ prefix: '/api/v1/staff' });

router.get('/', auth, getAll);
router.post('/', auth, bodyParser(), createStaff);

router.get('/:id([0-9]+)', auth, getStaff);
router.put('/:id([0-9]+)', auth, updateStaff);
router.del('/:id([0-9]+)', auth, deleteStaff);

async function getAll(ctx) {
    ctx.body = await staffModel.getAll();
}

async function createStaff(ctx) {
    const { staffKey, userId, locationId } = ctx.request.body;
    if (staffKey === config.staffKey) {
        const id = await staffModel.add(userId, locationId);
        if (id) {
            ctx.status = 201;
            ctx.body = { id, created: true, link: `${ctx.request.path}/${id}` };
        }
    } else {
        ctx.status = 401; //TODO: make sue this is right?
    }
}

async function getStaff(ctx) {
    const id = ctx.params.id;
    const staff = await staffModel.getByStaffId(id);
    if (staff) {
        ctx.body = staff;
    }
}

async function updateStaff(ctx) {
    const id = ctx.params.id;
    const { locationId } = ctx.request.body;
    const result = await staffModel.update(id, locationId);
    if (result) {
        ctx.body = { id, updated: true, link: `${ctx.request.path}/${id}` };
    }
}

async function deleteStaff(ctx) {
    const id = ctx.params.id;
    const result = await staffModel.delete(id);
    if (result) {
        ctx.body = { id, deleted: true };
    }
}