'use strict';

/**
 * @file JSON Web Token helper. Used for generating and validating JWT.
 * @module helpers/jwt
 * @author Bartlomiej Wlodarski
 */

const jwt = require('jsonwebtoken');

/**
 * Payload object. Gets encoded to make a JWT.
 * @typedef Payload
 * @type {object}
 * @property {string} token a JWT or refresh token.
 * @property {string} exp how long the token expires in.
 */

/**
 * Verifies whether a JWT token is valid.
 * @param {string} token a JWT token to verify.
 * @param {string} secret the secret key used to sign the keys.
 * @returns {object|null} the data decoded from the token.
 */
exports.verify = (token, secret) => {
	try {
		const payload = jwt.verify(token, secret);
		return payload;
	} catch (error) {
		return null;
	}
};

/**
 * Generates a new JWT token and refresh token using a valid refresh token.
 * @param {object} payload the data to use to generate a token.
 * @param {string} secret the key to use to generate a token.
 * @param {string} expiresIn how long the token should be valid for.
 * @returns {Payload} a JWT token with its expiration date
 * @see modules:helpers/jwt.Payload
 */
exports.generate = (payload, secret, expiresIn) => {
	// Need to remove the 'Issued at' property for new tokens to be generated.
	delete payload.exp;
	delete payload.iat;
	const token = jwt.sign(payload, secret, { expiresIn });
	const epoch = jwt.decode(token, { complete: true }).payload.exp;
	const exp = new Date(epoch * 1000);
	return { token, exp };
};
