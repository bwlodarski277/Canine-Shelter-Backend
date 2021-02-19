const db = require('../helpers/database');
const { db, run } = require('../helpers/database');

/**
 * Gets a staff member's location by ID.
 * @param {number} userId ID of the staff to fetch.
 * @returns {object} record containing staff member's location.
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
 * @returns {number} ID of the newly inserted row.
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
 * @returns {object} updated staff entry.
 */
exports.update = async (userId, locationId) => {
    const [data] = await run(async () =>
        await db('staff').where({ userId }).update({ locationId }));
    return data;
}

/**
 * Deletes a staff entry from the DB.
 * @param {Object} userId ID of the user to delete.
 * @returns {number} number of affected rows (should be 1).
 */
exports.delete = async userId => {
    const data = await run(async () =>
        await db('staff').where({ userId }).delete());
    return data;
}