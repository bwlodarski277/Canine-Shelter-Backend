const { db, run } = require('../helpers/database');

/**
 * Gets a dog's location by their ID.
 * @param {number} dogId ID of the dog to fetch.
 */
exports.getByDogId = async dogId => {
    const [data] = await run(async () =>
        await db('dogLocations').where({ dogId }));
    return data;
}

/**
 * Gets all the dogs with a location ID.
 * @param {number} locationId ID of the location to fetch.
 */
exports.getByLocationId = async locationId => {
    const data = await run(async () =>
        await db('dogLocations').where({ locationId }));
    return data;
}

/**
 * Creates a new location entry in the DB.
 * @param {Object} location location data to pass to the DB.
 */
exports.add = async (dogId, locationId) => {
    const [data] = await run(async () =>
        await db('dogLocations').insert({ dogId, locationId }));
    return data;
}

/**
 * Updates a location entry in the DB.
 * @param {number} dogId ID of the dog to update
 * @param {number} locationId ID to assign to the dog
 */
exports.update = async (dogId, locationId) => {
    const data = await run(async () =>
        await db('dogLocations').where({ dogId }).update({ locationId }));
    return data;
}

/**
 * Deletes a dog location entry from the DB.
 * @param {Object} id ID of the location to delete
 */
exports.delete = async dogId => {
    const data = await run(async () =>
        await db('dogLocations').where({ dogId }).delete());
    return data;
}