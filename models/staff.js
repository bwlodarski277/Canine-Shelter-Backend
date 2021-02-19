const db = require('../helpers/database');
const { db, run } = require('../helpers/database');

/**
 * Gets a staff member's location by ID.
 * @param {number} userId ID of the staff to fetch.
 * @returns {Promise<object>} record containing staff member's location.
 * @async
 */
exports.getByUserId = async userId => {
    const [data] = await run(async () =>
        await db('staffs').where({ userId }));
    return data;
}

/**
 * Creates a new staff member entry in the DB.
 * @param {number} userId ID of the user to assign to a location.
 * @param {number} locationId ID of the location to assign staff to.
 * @returns {Promise<number>} ID of the newly inserted row.
 * @async
 */
exports.add = async (userId, locationId) => {
    const [data] = await run(async () =>
        await db('staff').insert({ userId, locationId }));
    return data;
}

/**
 * Updates a staff entry in the DB.
 * @param {number} userId ID of the staff to update.
 * @param {number} locationId new location to assign to the staff.
 * @returns {Promise<object>} updated staff entry.
 * @async
 */
exports.update = async (userId, locationId) => {
    const [data] = await run(async () =>
        await db('staff').where({ userId }).update({ locationId }));
    return data;
}

/**
 * Deletes a staff entry from the DB.
 * @param {Object} userId ID of the user to delete.
 * @returns {Promise<number>} number of affected rows (should be 1).
 * @async
 */
exports.delete = async userId => {
    const data = await run(async () =>
        await db('staff').where({ userId }).delete());
    return data;
}