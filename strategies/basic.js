const BasicStrategy = require('passport-http').BasicStrategy;
const users = require('../models/users');
const bcrypt = require('bcrypt');

/**
 * Checks if a password is valid.
 * @param {object} user user object from the database.
 * @param {string} password password to check.
 * @returns {boolean} stating whether password is valid or not.
 * @async
 */
const verifyPassword = async (user, password) => {
    return await bcrypt.compare(password, user.password);
}

/**
 * User authenticator for basic strategy authentication.
 * @param {string} username username to try.
 * @param {string} password password to try.
 * @param {function} done function called when authentication is successful or fails.
 * @async
 */
const checkUser = async (username, password, done) => {
    let user;

    try {
        user = await users.findByUsername(username);
    } catch (error) {
        console.error(`Error during authentication for user ${username}.`);
        return done(error);
    }

    // If the user exists
    if (user) {
        const verified = await verifyPassword(user, password);
        if (verified) {
            console.log(`Successfully authenticated use ${username}.`);
            // Overwriting the user variable to make sure password is not returned.
            user = await users.getById(user.id);
            return done(null, user);
        } else {
            console.log(`Incorrect password for user ${username}.`);
            return done(null, false);
        }
    } else {
        console.log(`No user found with username ${username}.`)
    }
    return done(null, false);
    // return done(null, { role: 'guest' });
}

module.exports = new BasicStrategy(checkUser);