const Ajv = require('ajv').default;
const addFormats = require('ajv-formats').default;

const { breed } = require('../schemas/breeds.json').definitions;
const { dog, dogBreed, dogLocation } = require('../schemas/dogs.json').definitions;
const { location, chat, message } = require('../schemas/locations.json').definitions;
// const jwt = require('../schemas/login.json').definitions;
const { staff } = require('../schemas/staff.json').definitions;
const { user, favourite } = require('../schemas/users.json').definitions;

const makeValidator = schema => {
    const ajv = new Ajv({ allErrors: true });
    addFormats(ajv); // Adding string formats, e.g. email or uri.
    const validate = ajv.compile(schema);

    const handler = async (ctx, next) => {
        const { body } = ctx.request;

        if (validate(body)) {
            await next();
        } else {
            ctx.status = 400;
            const errors = validate.errors.map(err => {
                const { dataPath, message } = err;
                return { item: dataPath, message };
            })
            ctx.body = { errors };
        }
    }

    return handler;
}

exports.validateDreed = makeValidator(breed);
exports.validateDog = makeValidator(dog);
exports.validateDogBreed = makeValidator(dogBreed);
exports.validateDogLocation = makeValidator(dogLocation);
exports.validateLocation = makeValidator(location);
// exports.validateLogin = makeValidator(login);
// exports.validateJwt = makeValidator(jwt);
exports.validateChat = makeValidator(chat);
exports.validateMessage = makeValidator(message);
exports.validateStaff = makeValidator(staff);
exports.validateuser = makeValidator(user);
exports.validateFavourite = makeValidator(favourite);