const { db, run } = require('../helpers/database');

/**
 * Gets all the chats with a location.
 * @param {number} locationId ID of the location.
 */
exports.getAll = async locationId => {
    const data = await run(async () =>
        await db('chats').where({ locationId }));
    return data;
}

/**
 * Creates a new chat between a location and user.
 * @param {number} locationId ID of the location being contacted.
 * @param {number} userId ID of the user contacting the location.
 */
exports.add = async (locationId, userId) => {
    const [data] = await run(async () =>
        await db('chats').insert({ locationId, userId }));
    return data;
}

exports.getById = async id => {
    const [data] = await run(async () =>
        await db('chats').where({ id }));
    return data;
}


exports.delete = async id => {
    const data = await run(async () =>
        await db('chats').where({ id }).delete());
    return data;
}