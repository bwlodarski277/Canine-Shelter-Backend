const db = require('../helpers/database');
const { db, run } = require('../helpers/database');

/**
 * Gets a staff member's location by ID.
 * @param {number} userId ID of the staff to fetch.
 */
exports.getByUserId = async id => {
    const [data] = await run(async () =>
        await db('staffs').where({ userId: id }));
    return data;
}

/**
 * Creates a new staff member entry in the DB.
 * @param {Object} staff staff data to pass to the DB.
 */
exports.add = async staff => {
    const [data] = await run(async () =>
        await db('staff').insert(staff));
    return data;
}

/**
 * Updates a staff entry in the DB.
 * @param {number} id ID of the staff to update
 * @param {Object} staff data to pass to the DB
 */
exports.update = async (id, staff) => {
    const data = await run(async () =>
        await db('staff').where({ id }).update(staff));
    return data;
}

/**
 * Deletes a staff entry from the DB.
 * @param {Object} id ID of the staff to delete
 */
exports.delete = async id => {
    const data = await run(async () =>
        await db('staff').where({ id }).delete());
    return data;
}