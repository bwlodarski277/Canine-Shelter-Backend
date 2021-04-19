'use strict';

/**
 * @file Staff route endpoints.
 * @module routes/staff
 * @author Bartlomiej Wlodarski
 */

const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');

const staffModel = require('../models/staff');
const locationModel = require('../models/locations');

const { auth } = require('../controllers/auth');
const can = require('../permissions/staff');

const { validateStaff, validateStaffUpdate } = require('../controllers/validation');

const prefix = '/api/v1/staff';
const router = new Router({ prefix });
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
	let staffList = await staffModel.getAll();
	staffList = staffList.map(staff => {
		staff.links = {
			self: `${ctx.protocol}://${ctx.host}${prefix}/${staff.id}`,
			user: `${ctx.protocol}://${ctx.host}/api/v1/users/${staff.userId}`,
			location: `${ctx.protocol}://${ctx.host}/api/v1/locations/${staff.locationId}`
		};
		return staff;
	});
	ctx.body = staffList;
};

/**
 * Creates a staff member.
 * @param {object} ctx Koa context
 */
const createStaff = async ctx => {
	const { staffKey, locationId } = ctx.request.body;
	const { id: userId, role } = ctx.state.user;
	const permission = await can.create(role, staffKey);
	if (!permission.granted) {
		ctx.status = 403;
		return;
	}
	const location = await locationModel.getById(locationId);
	if (location) {
		const staff = await staffModel.getByLocationId(locationId);
		if (staff) {
			ctx.status = 400;
			ctx.message = 'Staff already exists for this location.';
			return;
		}
		const id = await staffModel.add(userId, locationId);
		ctx.status = 201;
		ctx.body = {
			id,
			created: true,
			link: `${ctx.protocol}://${ctx.host}${ctx.request.path}/${id}`
		};
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
	const staff = await staffModel.getByStaffId(id);
	if (staff) {
		staff.links = {
			self: `${ctx.protocol}://${ctx.host}${prefix}/${staff.id}`,
			user: `${ctx.protocol}://${ctx.host}/api/v1/users/${staff.userId}`,
			location: `${ctx.protocol}://${ctx.host}/api/v1/locations/${staff.locationId}`
		};
		ctx.body = staff;
	}
};

const updateStaff = async ctx => {
	const id = parseInt(ctx.params.id);
	const { locationId } = ctx.request.body;
	const { id: userId, role } = ctx.state.user;
	const staff = await staffModel.getByStaffId(id);
	if (staff) {
		const { userId: staffUser } = staff;
		const permission = await can.modify(role, userId, staffUser);
		if (!permission.granted) {
			ctx.status = 403;
			return;
		}
		const locationStaff = await staffModel.getByLocationId(locationId);
		if (locationStaff) {
			ctx.status = 400;
			ctx.body = { message: 'Location has a staff member assigned.' };
			return;
		}
		await staffModel.update(id, locationId);
		ctx.body = {
			id,
			updated: true,
			link: `${ctx.protocol}://${ctx.host}${ctx.request.path}`
		};
	}
};

const deleteStaff = async ctx => {
	const id = parseInt(ctx.params.id);
	const { id: userId, role } = ctx.state.user;
	const staff = await staffModel.getByStaffId(id);
	if (staff) {
		const { userId: staffUser } = staff;
		const permission = await can.delete(role, userId, staffUser);
		if (!permission.granted) {
			ctx.status = 403;
			return;
		}
		await staffModel.delete(id);
		ctx.body = { id, deleted: true };
	}
};

router.get('/', auth, getAll);
router.post('/', auth, validateStaff, createStaff);

router.get('/:id([0-9]+)', auth, getStaff);
router.put('/:id([0-9]+)', auth, validateStaffUpdate, updateStaff);
router.del('/:id([0-9]+)', auth, deleteStaff);

module.exports = router;
