/**
 * @file Locations model to manage interactions with the database.
 * @module models/locations
 * @author Bartlomiej Wlodarski
 */

const { db, run } = require('../helpers/database');

/**
 * Location object returned from the DB.
 * @typedef {object} Location
 * @property {number} id Location ID
 * @property {string} name Location name
 * @property {string} address Location address
 */

/**
 * Gets all location entries from the DB.
 * @returns {Promise<Array<Location>>} array of all location records.
 * @async
 */
exports.getAll = async () => {
    const data = await run(async () => await db('locations'));
    return data;
}

/**
 * Gets a single location entry from the DB by its ID.
 * @param {number} id ID of the location to fetch.
 * @returns {Promise<Location>} object containing the locations's record.
 * @async
 */
exports.getById = async id => {
    const [data] = await run(async () =>
        await db('locations').where({ id }));
    return data;
}

/**
 * Creates a new location entry in the DB.
 * @param {Location} location location data to pass to the DB.
 * @returns {Promise<number>} ID of the newly inserted row.
 * @async
 */
exports.add = async location => {
    const [data] = await run(async () =>
        await db('locations').insert(location));
    return data;
}

/**
 * Updates a location entry in the DB.
 * @param {number} id ID of the location to update.
 * @param {Location} location data to pass to the DB.
 * @returns {Promise<number>} number of updated rows (should be 1).
 * @async
 */
exports.update = async (id, location) => {
    const data = await run(async () =>
        await db('locations').where({ id }).update(location));
    return data;
}

/**
 * Deletes a location entry from the DB.
 * @param {number} id ID of the location to delete.
 * @returns {Promise<number>} number of affected rows (should be 1).
 * @async
 */
exports.delete = async id => {
    const data = await run(async () =>
        await db('locations').where({ id }).delete());
    return data;
}