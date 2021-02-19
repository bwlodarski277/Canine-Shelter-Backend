const { db, run } = require('../helpers/database');

/**
 * Gets a dog's location by their ID.
 * @param {number} dogId ID of the dog to fetch.
 * @returns {Promise<object>} record of dog's location.
 * @async
 */
exports.getByDogId = async dogId => {
    const [data] = await run(async () =>
        await db('dogLocations').where({ dogId }));
    return data;
}

/**
 * Gets all the dogs with a location ID.
 * @param {number} locationId ID of the location to fetch.
 * @returns {Promise<Array<object>>} list of dogs at the given location.
 * @async
 */
exports.getByLocationId = async locationId => {
    const data = await run(async () =>
        await db('dogLocations').where({ locationId }));
    return data;
}

/**
 * Creates a new location entry in the DB.
 * @param {number} dogId ID of the dog to set the location of.
 * @param {number} locationId ID of the location to assign to the dog.
 * @returns {Promise<true>} confirmation of insertion.
 * @async
 */
exports.add = async (dogId, locationId) => {
    await run(async () =>
        await db('dogLocations').insert({ dogId, locationId }));
    return true;
}

/**
 * Updates a location entry in the DB.
 * @param {number} dogId ID of the dog to update.
 * @param {number} locationId ID to assign to the dog.
 * @returns {Promise<object>} updated location entry.
 * @async
 */
exports.update = async (dogId, locationId) => {
    const [data] = await run(async () =>
        await db('dogLocations').where({ dogId }).update({ locationId }));
    return data;
}

/**
 * Deletes a dog location entry from the DB.
 * @param {number} dogId ID of the location to delete.
 * @returns {Promise<number>} number of affected rows (should be 1).
 * @async
 */
exports.delete = async dogId => {
    const data = await run(async () =>
        await db('dogLocations').where({ dogId }).delete());
    return data;
}