'use strict';

/**
 * @file Login route endpoints.
 * @module routes/login
 * @author Bartlomiej Wlodarski
 */

const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');
const jwtHelper = require('../helpers/jwt');

const { auth, basic, google } = require('../controllers/auth');
const { config } = require('../config');

const router = new Router({ prefix: '/api/v1/auth' });
router.use(bodyParser());

/**
 * Gets the current user's ID.
 * @param {object} ctx context passed from Koa.
 */
const login = async ctx => {
	const { id } = ctx.state.user;
	ctx.body = { id };
};

/**
 * Login route which generates a JWT token. Requires authentication.
 * @param {object} ctx context passed from Koa.
 */
const getJWT = async ctx => {
	const { id, username, provider } = ctx.state.user;
	const user = { sub: id, name: username, provider };
	const access = jwtHelper.generate(user, config.jwtSecret, '15m');
	const refresh = jwtHelper.generate(user, config.jwtRefresh, '7d');

	ctx.body = { access, refresh };
};

/**
 * Refresh route for generating a new JWT using a refresh token.
 * @param {object} ctx context passed from Koa.
 */
const refresh = async ctx => {
	const { refresh } = ctx.request.body;
	const payload = jwtHelper.verify(refresh, config.jwtRefresh);
	if (payload) {
		// Extracting the 'issued at' and 'expires' properties to assign them again.
		const { iat, exp, ...user } = payload;
		const access = jwtHelper.generate(user, config.jwtSecret, '15m');
		const refresh = jwtHelper.generate(user, config.jwtRefresh, '7d');

		ctx.body = { access, refresh };
	} else ctx.status = 401;
};

const googleCallback = async ctx => {
	const { id, username, provider } = ctx.state.user;
	const payload = { sub: id, name: username, provider };
	const access = jwtHelper.generate(payload, config.jwtSecret, '15m');
	const refresh = jwtHelper.generate(payload, config.jwtRefresh, '7d');

	ctx.body = { access, refresh };
};

router.get('/login', auth, login);
router.get('/jwt', basic, getJWT);
router.post('/jwt/refresh', refresh);
router.get('/google', google);
router.get('/google/callback', google, googleCallback);

module.exports = router;
