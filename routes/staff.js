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
const { ifNoneMatch, ifModifiedSince } = require('../helpers/caching');

const prefix = '/api/v1/staff';
const router = new Router({ prefix });
router.use(bodyParser());

/**
 * Gets all staff members from the database.
 * @param {object} ctx Koa context
 */
const getAll = async (ctx, next) => {
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
	return next();
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
		return;
	}
	ctx.status = 404;
	ctx.body = { message: 'Location does not exist.' };
};

/**
 * Gets a staff member
 * @param {object} ctx Koa context
 */
const getStaff = async (ctx, next) => {
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
		return next();
	}
	ctx.status = 404;
	ctx.body = { message: 'Staff does not exist.' };
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
		return;
	}
	ctx.status = 404;
	ctx.body = { message: 'Staff does not exist.' };
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
		return;
	}
	ctx.status = 404;
	ctx.body = { message: 'Staff does not exist.' };
};

const unstaffedLocations = async (ctx, next) => {
	const { role } = ctx.state.user;
	const permission = await can.read(role);
	if (!permission.granted) {
		ctx.status = 403;
		ctx.body = { message: 'Not a staff member.' };
		return;
	}
	const freeLocs = await locationModel.getFree();
	ctx.body = freeLocs;
	return next();
};

router.get('/', auth, getAll, ifNoneMatch);
router.post('/', auth, validateStaff, createStaff);

router.get('/:id([0-9]+)', auth, getStaff, ifModifiedSince);
router.put('/:id([0-9]+)', auth, validateStaffUpdate, updateStaff);
router.del('/:id([0-9]+)', auth, deleteStaff);

router.get('/unstaffed', auth, unstaffedLocations, ifNoneMatch);

module.exports = router;
