const { db, run } = require('../helpers/database');

/**
 * Gets all dog entries from the DB.
 */
exports.getAll = async () => {
    const data = await db('dogs');
    return data;
}

/**
 * Gets a single dog entry from the DB by their ID.
 * @param {number} id ID of the dog to fetch.
 */
exports.getById = async id => {
    const [data] = await run(async () =>
        await db('dogs').where({ id }));
    return data;
}

/**
 * Creates a new dog entry in the DB.
 * @param {Object} dog dog data to pass to the DB.
 */
exports.add = async dog => {
    const [data] = await run(async () =>
        await db('dogs').insert(dog));
    return data;
}

/**
 * Updates a dog entry in the DB.
 * @param {number} id ID of the dog to update
 * @param {Object} dog data to pass to the DB
 */
exports.update = async (id, dog) => {
    const data = await run(async () =>
        await db('dogs').where({ id }).update(dog));
    return data;
}

/**
 * Deletes a dog entry from the DB.
 * @param {Object} id ID of the dog to delete
 */
exports.delete = async id => {
    const data = await run(async () =>
        await db('dogs').where({ id }).delete());
    return data;
}