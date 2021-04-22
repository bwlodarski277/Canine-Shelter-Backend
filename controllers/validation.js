'use strict';

/**
 * @file Schema validator controller module.
 * @module controllers/validator
 * @author Bartlomiej Wlodarski
 */

const Ajv = require('ajv').default;
const addFormats = require('ajv-formats');

const { refresh } = require('../schemas/auth.json').definitions;
const { breed } = require('../schemas/breeds.json').definitions;
const { dog, dogUpdate, dogBreed, dogLocation } = require('../schemas/dogs.json').definitions;

const {
	location,
	locationUpdate,
	chat,
	message
} = require('../schemas/locations.json').definitions;

const { staff, staffUpdate } = require('../schemas/staff.json').definitions;
const { user, favourite, userUpdate } = require('../schemas/users.json').definitions;

/**
 * Creates a validator middleware for Koa.
 * @param {object} schema Schema object to validate against.
 * @returns {Handler} Validator middleware for Koa.
 * @see module:controllers/validator~Handler
 */
const makeValidator = schema => {
	const ajv = new Ajv({ allErrors: true });
	addFormats(ajv); // Adding string formats, e.g. email or uri.
	const validate = ajv.compile(schema);

	/**
	 * Koa middleware for handling schema validation.
	 * Continues to next middleware or sends a 400 response.
	 * @typedef Handler
	 * @type {function}
	 * @param {object} ctx Koa context.
	 * @param {function} next Next middleware to run.
	 */
	const handler = async (ctx, next) => {
		const { body } = ctx.request;

		if (validate(body)) await next();
		else {
			ctx.status = 400;
			const errors = validate.errors.map(err => {
				const { dataPath, message } = err;
				return { item: dataPath, message };
			});
			ctx.body = { errors };
			return;
		}
	};

	return handler;
};

exports.validateRefresh = makeValidator(refresh);
exports.validateBreed = makeValidator(breed);
exports.validateDog = makeValidator(dog);
exports.validateDogUpdate = makeValidator(dogUpdate);
exports.validateDogBreed = makeValidator(dogBreed);
exports.validateDogLocation = makeValidator(dogLocation);
exports.validateLocation = makeValidator(location);
exports.validateLocationUpdate = makeValidator(locationUpdate);
exports.validateChat = makeValidator(chat);
exports.validateMessage = makeValidator(message);
exports.validateStaff = makeValidator(staff);
exports.validateStaffUpdate = makeValidator(staffUpdate);
exports.validateUser = makeValidator(user);
exports.validateUserUpdate = makeValidator(userUpdate);
exports.validateFavourite = makeValidator(favourite);
