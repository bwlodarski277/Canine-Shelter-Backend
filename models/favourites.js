const { db, run } = require('../helpers/database');

/**
 * Gets a list of a user's favourite dogs.
 * @param {number} userId ID of the user's favourites to fetch.
 * @returns {Promise<Array<object>>} list of the user's favourite dogs.
 * @async
 */
exports.getByUserId = async userId => {
    const data = await run(async () =>
        await db('favourites').where({ userId }));
    return data;
}

/**
 * Gets a single favourite by user ID and dog ID.
 * @param {number} userId ID of user's favourite to fetch.
 * @param {number} dogId ID of favourited dog to fetch.
 * @returns {Promise<object>} record of user's favourited dog.
 * @async
 */
exports.getSingleFav = async (userId, dogId) => {
    const [data] = await run(async () =>
        await db('favourites').where({ userId, dogId }));
    return data;
}

/**
 * Gets a list of users that favourited a dog.
 * @param {number} dogId ID of the dog to find the favourites of.
 * @returns {Promise<Array<object>>} list of users who favourited a dog.
 * @async
 */
exports.getByDogId = async dogId => {
    const data = await run(async () =>
        await db('favourites').where({ dogId }));
    return data;
}

/**
 * Gets a count of users that favourited a dog.
 * @param {number} dogId ID of the dog to count the favourites of.
 * @returns {Promise<number>} count of users that favourited a dog.
 * @async
 */
exports.getFavCount = async dogId => {
    const [data] = await run(async () =>
        await db('favourites').where({ dogId }).count('dogId', { as: 'count' }));
    return data;
}

/**
 * Creates a new favourite entry in the DB.
 * @param {number} userId ID of user adding a favourite.
 * @param {number} dogId ID of dog a user wants to favourite.
 * @returns {Promise<true>} confirmation of insertion.
 * @async
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
 * @returns {Promise<number>} number of affected rows (should be 1).
 * @async
 */
exports.delete = async (userId, dogId) => {
    const data = await run(async () =>
        await db('favourites').where({ userId, dogId }).delete());
    return data;
}