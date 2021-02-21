const { db, run } = require('../helpers/database');

/**
 * Get a list of dog entries from the DB.
 * Allows for searching, filtering and sorting.
 * @param {string} [query] search for dogs by name and description.
 * @param {object} [filters] object of filters from the query.
 * @param {number} [page=1] which page to get data from.
 * @param {number} [limit=50] number of items on a page.
 * @param {string} [order='id'] what parameter to order by.
 * @param {'asc'|'desc'} [direction='asc'] direction to sort (asc. or desc.).
 * @returns {Promise<Array<object>>} array of selected dog records.
 * @async
 */
exports.getAll = async (query = '', filters = {}, page = 1, limit = 50, order = 'id', direction = 'asc') => {
    direction = (direction === 'desc') ? 'desc' : 'asc'; // If direction is anything but descending, use ascending.
    const offset = (page - 1) * limit;
    const data = await run(async () =>
        await db('dogs')
            .where(filters) // applying user filters (like age, gender).
            .andWhere((builder) => // ... WHERE <filters> AND (<name> OR <description>)
                // Applying search query
                builder.where('name', 'like', `%${query}%`) // Safe as it is escaped by driver
                    .orWhere('description', 'like', `%${query}%`)) // same as line above
            .orderBy(order, direction)
            .limit(limit).offset(offset));
    return data;
}

/**
 * Gets a single dog entry from the DB by their ID.
 * @param {number} id ID of the dog to fetch.
 * @returns {Promise<object>} object containing the dog's record.
 * @async
 */
exports.getById = async id => {
    const [data] = await run(async () =>
        await db('dogs').where({ id }));
    return data;
}

/**
 * Creates a new dog entry in the DB.
 * @param {object} dog dog data to pass to the DB.
 * @returns {Promise<number>} ID of the newly inserted row.
 * @async
 */
exports.add = async dog => {
    const [data] = await run(async () =>
        await db('dogs').insert(dog));
    return data;
}

/**
 * Updates a dog entry in the DB.
 * @param {number} id ID of the dog to update.
 * @param {object} dog data to pass to the DB.
 * @returns {Promise<number>} number of updated rows (should be 1).
 * @async
 */
exports.update = async (id, dog) => {
    const data = await run(async () =>
        await db('dogs').where({ id }).update(dog));
    return data;
}

/**
 * Deletes a dog entry from the DB.
 * @param {number} id ID of the dog to delete.
 * @returns {Promise<number>} number of affected rows (should be 1).
 * @async
 */
exports.delete = async id => {
    const data = await run(async () =>
        await db('dogs').where({ id }).delete());
    return data;
}