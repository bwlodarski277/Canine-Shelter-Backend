/**
 * @file Login route endpoints.
 * @module routes/login
 * @author Bartlomiej Wlodarski
 */

const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');
const jwt = require('jsonwebtoken');
const jwtHelper = require('../helpers/jwt');

const { basic, google } = require('../controllers/auth');
const { config } = require('../config');

const router = new Router({ prefix: '/api/v1/auth' });

router.get('/jwt', basic, getJWT);

router.post('/jwt/refresh', bodyParser(), refresh);

router.get('/google', google);

router.get('/google/callback', google, googleCallback);

/**
 * Login route which generates a JWT token. Requires authentication.
 * @param {object} ctx context passed from Koa.
 */
async function getJWT(ctx) {
	const { id, username, provider } = ctx.state.user;
	const user = { sub: id, name: username, provider };
	const access = jwtHelper.generate(user, config.jwtSecret, '15m');
	const refresh = jwtHelper.generate(user, config.jwtRefresh, '7d');

	ctx.body = { access, refresh };
}

/**
 * Refresh route for generating a new JWT using a refresh token.
 * @param {object} ctx context passed from Koa.
 */
async function refresh(ctx) {
	const { refresh } = ctx.request.body;
	let payload = jwtHelper.verify(refresh, config.jwtRefresh);
	if (payload) {
		// Extracting the 'issued at' and 'expires' properties to assign them again.
		let { iat, exp, ...user } = payload;
		const access = jwtHelper.generate(user, config.jwtSecret, '15m');
		const refresh = jwtHelper.generate(user, config.jwtRefresh, '7d');

		ctx.body = { access, refresh };
	} else {
		ctx.status = 401;
	}
}

async function googleCallback(ctx) {
	const { id, username, provider } = ctx.state.user;
	const payload = { sub: id, name: username, provider };
	const access = jwtHelper.generate(payload, config.jwtSecret, '15m');
	const refresh = jwtHelper.generate(payload, config.jwtRefresh, '7d');

	ctx.body = { access, refresh };
}

module.exports = router;
