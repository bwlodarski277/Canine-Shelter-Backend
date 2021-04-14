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
const can = require('../permissions/staff');

const { validateStaff } = require('../controllers/validation');

const router = new Router({ prefix: '/api/v1/staff' });
router.use(bodyParser());

/**
 * Gets all staff members from the database.
 * @param {object} ctx Koa context
 */
const getAll = async ctx => {
	const { role } = ctx.state.user;
	const permission = await can.read(role);
	if (!permission.granted) {
		ctx.status = 403;
		return;
	}
	ctx.body = await staffModel.getAll();
};

/**
 * Creates a staff member.
 * @param {object} ctx Koa context
 */
const createStaff = async ctx => {
	const { staffKey, userId, locationId } = ctx.request.body;
	const { role } = ctx.state.user;
	const permission = await can.create(role, staffKey);
	if (!permission.granted) {
		ctx.status = 403;
		return;
	}
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
};

/**
 * Gets a staff member
 * @param {object} ctx Koa context
 * @returns
 */
const getStaff = async ctx => {
	const id = ctx.params.id;
	const { role } = ctx.state.user;
	const permission = await can.read(role);
	if (!permission.granted) {
		ctx.status = 403;
		return;
	}
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
	const { id: userId, role } = ctx.state.user;
	try {
		const staff = await staffModel.getByStaffId(id);
		if (staff) {
			const permission = await can.modify(role, userId, staff.userId);
			if (!permission.granted) {
				ctx.status = 403;
				return;
			}
			const result = await staffModel.update(id, locationId);
			if (result) ctx.body = { id, updated: true, link: `${ctx.request.path}/${id}` };
		}
	} catch (err) {
		ctx.status = 500;
		ctx.body = err;
	}
};

const deleteStaff = async ctx => {
	const id = ctx.params.id;
	const { role } = ctx.state.user;
	const permission = await can.delete(role);
	if (!permission.granted) {
		ctx.status = 403;
		return;
	}
	try {
		const result = await staffModel.delete(id);
		if (result) ctx.body = { id, deleted: true };
	} catch (err) {
		ctx.status = 500;
		ctx.body = err;
	}
};

router.get('/', auth, getAll);
router.post('/', auth, validateStaff, createStaff);

router.get('/:id([0-9]+)', auth, getStaff);
router.put('/:id([0-9]+)', auth, validateStaff, updateStaff);
router.del('/:id([0-9]+)', auth, deleteStaff);

module.exports = router;
