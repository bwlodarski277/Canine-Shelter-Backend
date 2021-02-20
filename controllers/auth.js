const passport = require('koa-passport');
const basicAuth = require('../strategies/basic');
const jwt = require('../strategies/jwt');

passport.use(basicAuth);
passport.use(jwt);

/**
 * Authenticator middleware.
 * To be used in routes that are meant to require authentication.
 */
module.exports = passport.authenticate(['basic', 'jwt'], { session: false });