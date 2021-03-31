'use strict';

const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { googleOauth } = require('../config').config;
const userModel = require('../models/users');

const options = {
	clientID: googleOauth.clientID,
	clientSecret: googleOauth.clientSecret,
	callbackURL: 'http://localhost:3000/api/v1/auth/google/callback'
};

const checkUser = async (_accesToken, _refreshToken, profile, done) => {
	const person = profile._json;
	let user = await userModel.findByUsername(person.name, 'google');
	try {
		if (user) {
			console.log(`Authenticated user ${person.name}`);
			return done(null, user);
		}
		const newUser = {
			role: 'user',
			provider: 'google',
			username: person.name,
			email: person.email,
			firstName: person.given_name,
			lastName: person.family_name,
			imageUrl: person.picture
		};
		const id = await userModel.add(newUser);
		user = await userModel.getById(id);

		console.log(`Created new user ${person.name}`);
		return done(null, user);
	} catch (error) {
		console.error(`Error during authentication for user ${profile.displayName}`);
		return done(error);
	}
};

module.exports = new GoogleStrategy(options, checkUser);
