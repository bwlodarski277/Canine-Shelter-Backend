const { db, run } = require('../helpers/database');

/**
 * Gets all breed entries from the DB.
 */
exports.getAll = async () => {
    const data = await run(async () =>
        await db('breeds'));
    return data;
}

/**
 * Gets a single breed entry from the DB by its ID.
 * @param {number} id ID of the breed to fetch.
 */
exports.getById = async id => {
    const [data] = await run(async () =>
        await db('breeds').where({ id }));
    return data;
}

/**
 * Creates a new breed entry in the DB.
 * @param {Object} breed breed data to pass to the DB.
 */
exports.add = async breed => {
    const [data] = await run(async () =>
        await db('breeds').insert(breed));
    return data;
}

/**
 * Updates a breed entry in the DB.
 * @param {number} id ID of the breed to update
 * @param {Object} breed data to pass to the DB
 */
exports.update = async (id, breed) => {
    const data = await run(async () =>
        await db('breeds').where({ id }).update(breed));
    return data;
}

/**
 * Deletes a breed entry from the DB.
 * @param {Object} id ID of the breed to delete
 */
exports.delete = async id => {
    const data = await run(async () =>
        await db('breeds').where({ id }).delete());
    return data;
}