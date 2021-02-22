/**
 * @file Login route endpoints.
 * @module routes/login
 * @author Bartlomiej Wlodarski
 */

const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');
const jwt = require('jsonwebtoken');

const auth = require('../controllers/auth');
const { config } = require('../config');

const router = new Router({ prefix: '/api/v1/login' });

router.get('/', auth, bodyParser(), login);

/**
 * Login route which generates a JWT token. Requires authentication.
 * @param {object} ctx context passed from Koa.
 */
async function login(ctx) {
    const { id, username } = ctx.state.user;
    const user = { sub: id, name: username };
    const token = jwt.sign(user, config.jwtSecret, { expiresIn: '1d' });

    // Getting date 1 day from now
    let expires = new Date();
    expires.setDate(expires.getDate() + 1);
    ctx.body = { token, expires };
}

module.exports = router;