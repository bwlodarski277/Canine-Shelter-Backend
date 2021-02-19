const { db, run } = require('../helpers/database');

/**
 * Gets all location entries from the DB.
 * @returns {Array<object>} array of all location records.
 */
exports.getAll = async () => {
    const data = await run(async () => await db('locations'));
    return data;
}

/**
 * Gets a single location entry from the DB by its ID.
 * @param {number} id ID of the location to fetch.
 * @returns {object} object containing the locations's record.
 */
exports.getById = async id => {
    const [data] = await run(async () =>
        await db('locations').where({ id }));
    return data;
}

/**
 * Creates a new location entry in the DB.
 * @param {object} location location data to pass to the DB.
 * @returns {number} ID of the newly inserted row.
 */
exports.add = async location => {
    const [data] = await run(async () =>
        await db('locations').insert(location));
    return data;
}

/**
 * Updates a location entry in the DB.
 * @param {number} id ID of the location to update.
 * @param {object} location data to pass to the DB.
 * @returns {object} updated database entry.
 */
exports.update = async (id, location) => {
    const [data] = await run(async () =>
        await db('locations').where({ id }).update(location));
    return data;
}

/**
 * Deletes a location entry from the DB.
 * @param {number} id ID of the location to delete.
 * @returns {number} number of affected rows (should be 1).
 */
exports.delete = async id => {
    const data = await run(async () =>
        await db('locations').where({ id }).delete());
    return data;
}