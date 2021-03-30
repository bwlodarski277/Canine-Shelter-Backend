const jwt = require('jsonwebtoken');

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
 * @returns {object} a JWT token with its expiration date.
 */
exports.generate = (payload, secret, expiresIn) => {
	// Need to remove the 'Issued at' property for new tokens to be generated.
	delete payload.exp, payload.iat;
	const token = jwt.sign(payload, secret, { expiresIn });
	return { token, expiresIn };
};
