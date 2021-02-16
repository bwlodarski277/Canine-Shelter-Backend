const { db, run } = require('../helpers/database');

/**
 * Gets all the dogs with a breed ID.
 * @param {number} userId ID of the user's favourites to fetch.
 */
exports.getByUserId = async userId => {
    const data = await run(async () =>
        await db('favourites').where({ userId }));
    return data;
}

exports.getByDogId = async (userId, dogId) => {
    const [data] = await run(async () =>
        await db('favourites').where({ userId, dogId }));
    return data;
}

/**
 * Creates a new favourite entry in the DB.
 * @param {number} userId ID of user adding a favourite
 * @param {number} dogId ID of dog a user wants to favourite
 */
exports.add = async (userId, dogId) => {
    const data = await run(async () =>
        await db('favourites').insert({ userId, dogId }));
    return data;
}

/**
 * Deletes a favourite entry from the DB.
 * @param {number} userId ID of user wanting to remove favourite
 * @param {number} dogId ID of dog the user wants to delete a favourite of
 */
exports.delete = async (userId, dogId) => {
    const data = await run(async () =>
        await db('favourites').where({ userId, dogId }).delete());
    return data;
}