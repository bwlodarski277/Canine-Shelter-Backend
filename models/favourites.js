const { db, run } = require('../helpers/database');

/**
 * Gets a list of a user's favourite dogs.
 * @param {number} userId ID of the user's favourites to fetch.
 * @returns {Array<object>} list of the user's favourite dogs.
 */
exports.getByUserId = async userId => {
    const data = await run(async () =>
        await db('favourites').where({ userId }));
    return data;
}

/**
 * Gets a list of users that favourited a dog.
 * @param {number} dogId ID of the dog to find the favourites of.
 * @returns {Array<object>} list of users who favourited a dog.
 */
exports.getByDogId = async dogId => {
    const data = await run(async () =>
        await db('favourites').where({ dogId }));
    return data;
}

/**
 * Creates a new favourite entry in the DB.
 * @param {number} userId ID of user adding a favourite.
 * @param {number} dogId ID of dog a user wants to favourite.
 * @returns {true} confirmation of insertion.
 */
exports.add = async (userId, dogId) => {
    await run(async () =>
        await db('favourites').insert({ userId, dogId }));
    return true;
}

/**
 * Deletes a favourite entry from the DB.
 * @param {number} userId ID of favouriting user.
 * @param {number} dogId ID of favourited dog.
 * @returns {number} number of affected rows (should be 1).
 */
exports.delete = async (userId, dogId) => {
    const data = await run(async () =>
        await db('favourites').where({ userId, dogId }).delete());
    return data;
}