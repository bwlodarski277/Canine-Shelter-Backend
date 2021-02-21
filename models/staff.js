const db = require('../helpers/database');
const { db, run } = require('../helpers/database');

exports.getAll = async () => {
    const data = await run(async () =>
        await db('staff'));
    return data;
}

/**
 * Gets a staff member's location by ID.
 * @param {number} userId User ID of the staff to fetch.
 * @returns {Promise<object>} record containing staff member's location.
 * @async
 */
exports.getByUserId = async userId => {
    const [data] = await run(async () =>
        await db('staff').where({ userId }));
    return data;
}

/**
 * Gets a staff member's location by ID.
 * @param {number} userId ID of the staff to fetch.
 * @returns {Promise<object>} record containing staff member's location.
 * @async
 */
exports.getByStaffId = async id => {
    const [data] = await run(async () =>
        await db('staff').where({ id }));
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
 * @param {number} id ID of the staff to update.
 * @param {number} locationId new location to assign to the staff.
 * @returns {Promise<number>} number of updated rows (should be 1).
 * @async
 */
exports.update = async (id, locationId) => {
    const data = await run(async () =>
        await db('staff').where({ id }).update({ locationId }));
    return data;
}

/**
 * Deletes a staff entry from the DB.
 * @param {Object} id ID of the staff to delete.
 * @returns {Promise<number>} number of affected rows (should be 1).
 * @async
 */
exports.delete = async id => {
    const data = await run(async () =>
        await db('staff').where({ id }).delete());
    return data;
}