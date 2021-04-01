'use strict';

/**
 * @file Staff route endpoints.
 * @module routes/staff
 * @author Bartlomiej Wlodarski
 */

const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');

const staffModel = require('../models/staff');

const auth = require('../controllers/auth');
const { config } = require('../config');

const router = new Router({ prefix: '/api/v1/staff' });
router.use(bodyParser());

const getAll = async ctx => {
	ctx.body = await staffModel.getAll();
};

const createStaff = async ctx => {
	const { staffKey, userId, locationId } = ctx.request.body;
	if (staffKey === config.staffKey)
		try {
			const id = await staffModel.add(userId, locationId);
			if (id) {
				ctx.status = 201;
				ctx.body = { id, created: true, link: `${ctx.request.path}/${id}` };
			}
		} catch (err) {
			ctx.status = 500;
			ctx.body = err;
		}
	else ctx.status = 401;
};

const getStaff = async ctx => {
	const id = ctx.params.id;
	try {
		const staff = await staffModel.getByStaffId(id);
		if (staff) ctx.body = staff;
	} catch (err) {
		ctx.status = 500;
		ctx.body = err;
	}
};

const updateStaff = async ctx => {
	const id = ctx.params.id;
	const { locationId } = ctx.request.body;
	try {
		const result = await staffModel.update(id, locationId);
		if (result) ctx.body = { id, updated: true, link: `${ctx.request.path}/${id}` };
	} catch (err) {
		ctx.status = 500;
		ctx.body = err;
	}
};

const deleteStaff = async ctx => {
	const id = ctx.params.id;
	try {
		const result = await staffModel.delete(id);
		if (result) ctx.body = { id, deleted: true };
	} catch (err) {
		ctx.status = 500;
		ctx.body = err;
	}
};

router.get('/', auth, getAll);
router.post('/', auth, createStaff);

router.get('/:id([0-9]+)', auth, getStaff);
router.put('/:id([0-9]+)', auth, updateStaff);
router.del('/:id([0-9]+)', auth, deleteStaff);

module.exports = router;
