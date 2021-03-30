const passport = require('koa-passport');

const basicAuth = require('../strategies/basic');
const jwt = require('../strategies/jwt');
const googleOauth = require('../strategies/google-oauth2');

passport.use(basicAuth);
passport.use(jwt);
passport.use(googleOauth);

/**
 * Authenticator middleware.
 * To be used in routes that are meant to require authentication.
 */
exports.auth = passport.authenticate(['jwt', 'basic'], {
	session: false
});

exports.basic = passport.authenticate(['basic'], { session: false });

exports.jwt = passport.authenticate(['jwt'], { session: false });

exports.google = passport.authenticate(['google'], {
	session: false,
	scope: ['profile', 'email']
});
