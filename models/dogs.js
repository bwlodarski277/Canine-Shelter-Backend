const { db, run } = require('../helpers/database');

/**
 * Gets all dog entries from the DB.
 * @returns {Array<object>} array of all dog records.
 */
exports.getAll = async () => {
    const data = await run(async () => await db('dogs'));
    return data;
}

/**
 * Gets a single dog entry from the DB by their ID.
 * @param {number} id ID of the dog to fetch.
 * @returns {object} object containing the dog's record.
 */
exports.getById = async id => {
    const [data] = await run(async () =>
        await db('dogs').where({ id }));
    return data;
}

/**
 * Creates a new dog entry in the DB.
 * @param {object} dog dog data to pass to the DB.
 * @returns {number} ID of the newly inserted row.
 */
exports.add = async dog => {
    const [data] = await run(async () =>
        await db('dogs').insert(dog));
    return data;
}

/**
 * Updates a dog entry in the DB.
 * @param {number} id ID of the dog to update.
 * @param {object} dog data to pass to the DB.
 * @returns {object} updated database entry.
 */
exports.update = async (id, dog) => {
    const [data] = await run(async () =>
        await db('dogs').where({ id }).update(dog));
    return data;
}

/**
 * Deletes a dog entry from the DB.
 * @param {number} id ID of the dog to delete.
 * @returns {number} number of affected rows (should be 1).
 */
exports.delete = async id => {
    const data = await run(async () =>
        await db('dogs').where({ id }).delete());
    return data;
}