'use strict';

/**
 * @file JWT authentication strategy.
 * @module strategies/jwt
 * @author Bartlomiej Wlodarski
 */

const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;

const { config } = require('../config');
const userModel = require('../models/users');

const opts = {
	jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
	secretOrKey: config.jwtSecret
};

/**
 * User authenticator for JWT authentication.
 * @param {object} jwtPayload JWT payload extracted from header.
 * @param {function} done function called when authentication is successful or fails.
 * @async
 */
const checkUser = async (jwtPayload, done) => {
	let user;

	try {
		user = await userModel.getById(jwtPayload.sub);
	} catch (error) {
		console.error(`Error during authentication for user ${jwtPayload.name}`);
		return done(error);
	}

	if (user) {
		console.log(`Successfully authenticated user ${jwtPayload.name}.`);
		return done(null, user);
	}
	return done(null, false);
	// return done(null, { role: 'guest' });
};

module.exports = new JwtStrategy(opts, checkUser);
