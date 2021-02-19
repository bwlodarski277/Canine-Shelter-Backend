const { db, run } = require('../helpers/database');

/**
 * Gets all breed entries from the DB.
 * @returns {Array<object>} array of all breed records.
 */
exports.getAll = async () => {
    const data = await run(async () => await db('breeds'));
    return data;
}

/**
 * Gets a single breed entry from the DB by its ID.
 * @param {number} id ID of the breed to fetch.
 * @returns {object} object containing the breed record.
 */
exports.getById = async id => {
    const [data] = await run(async () =>
        await db('breeds').where({ id }));
    return data;
}

/**
 * Creates a new breed entry in the DB.
 * @param {object} breed breed data to pass to the DB.
 * @returns {number} ID of newly inserted row.
 */
exports.add = async breed => {
    const [data] = await run(async () =>
        await db('breeds').insert(breed));
    return data;
}

/**
 * Updates a breed entry in the DB.
 * @param {number} id ID of the breed to update.
 * @param {object} breed data to pass to the DB.
 * @returns {object} updated database entry.
 */
exports.update = async (id, breed) => {
    const [data] = await run(async () =>
        await db('breeds').where({ id }).update(breed));
    return data;
}

/**
 * Deletes a breed entry from the DB.
 * @param {number} id ID of the breed to delete.
 * @returns {number} number of affected rows (should be 1).
 */
exports.delete = async id => {
    const data = await run(async () =>
        await db('breeds').where({ id }).delete());
    return data;
}