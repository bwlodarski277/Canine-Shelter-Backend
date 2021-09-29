'use strict';

/**
 * @file Authentication controller module.
 * @module controllers/authenticator
 * @author Bartlomiej Wlodarski
 */

const passport = require('koa-passport');

const basicAuth = require('../strategies/basic');
const jwt = require('../strategies/jwt');
// const googleOauth = require('../strategies/google-oauth2');

passport.use(basicAuth);
passport.use(jwt);
// passport.use(googleOauth);

/**
 * General authenticator middleware.
 * To be used in routes that are meant to require authentication.
 */
exports.auth = passport.authenticate(['jwt', 'basic'], {
	session: false
});

/**
 * Basic authenticator middleware.
 * To be used in rotues that should only use basic authentication.
 */
exports.basic = passport.authenticate(['basic'], { session: false });

/**
 * JSON Web Token authenticator middleware.
 * To be used in routes that should only use JWT authentication.
 */
exports.jwt = passport.authenticate(['jwt'], { session: false });

/**
 * Google OAuth2.0 authenticator middleware.
 * To be used in the Google sign-in route.
 */
// exports.google = passport.authenticate(['google'], {
// 	session: false,
// 	scope: ['profile', 'email']
// });
