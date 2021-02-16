const { db, run } = require('../helpers/database');

/**
 * Gets all location entries from the DB.
 */
exports.getAll = async () => {
    const data = await run(async () => await db('locations'));
    return data;
}

/**
 * Gets a single location entry from the DB by its ID.
 * @param {number} id ID of the location to fetch.
 */
exports.getById = async id => {
    const [data] = await run(async () =>
        await db('locations').where({ id }));
    return data;
}

/**
 * Creates a new location entry in the DB.
 * @param {Object} location location data to pass to the DB.
 */
exports.add = async location => {
    const [data] = await run(async () =>
        await db('locations').insert(location));
    return data;
}

/**
 * Updates a location entry in the DB.
 * @param {number} id ID of the location to update
 * @param {Object} location data to pass to the DB
 */
exports.update = async (id, location) => {
    const data = await run(async () =>
        await db('locations').where({ id }).update(location));
    return data;
}

/**
 * Deletes a location entry from the DB.
 * @param {Object} id ID of the location to delete
 */
exports.delete = async id => {
    const data = await run(async () =>
        await db('locations').where({ id }).delete());
    return data;
}