const { db, run } = require('../helpers/database');

/**
 * Gets a dog's breed(s) by their ID.
 * @param {number} dogId ID of the dog to fetch.
 * @returns {Promise<object>} database entry containing dog's breed.
 * @async
 */
exports.getByDogId = async dogId => {
    const [data] = await run(async () =>
        await db('dogBreeds').where({ dogId }));
    return data;
}

/**
 * Gets all the dogs with a breed ID.
 * @param {number} breedId ID of the breed to fetch.
 * @returns {Promise<Array<object>>} list of all dogs of the given breed.
 * @async
 */
exports.getByBreedId = async breedId => {
    const data = await run(async () =>
        await db('dogBreeds').where({ breedId }));
    return data;
}

/**
 * Sets a dog's breed in the database.
 * @param {number} dogId ID of the dog to set the breed of.
 * @param {number} breedId ID of the breed to assign to the dog.
 * @returns {Promise<true>} confirmation of insertion.
 * @async
 */
exports.add = async (dogId, breedId) => {
    // Not retrieving any data, as the insert method returns PK of inserted row.
    // There is no PK in this row, as it is a composite key.
    await run(async () =>
        await db('dogBreeds').insert({ dogId, breedId }));
    return true;
}

/**
 * Updates a breed entry in the DB.
 * @param {number} dogId ID of the dog to update.
 * @param {number} breedId ID to assign to the dog.
 * @returns {Promise<object>} updated breed entry.
 * @async
 */
exports.update = async (dogId, breedId) => {
    const [data] = await run(async () =>
        await db('dogBreeds').where({ dogId }).update({ breedId }));
    return data;
}

/**
 * Deletes a dog breed entry from the DB.
 * @param {number} dogId ID of dog that is having its breed removed.
 * @returns {Promise<number>} number of affected rows (should be 1).
 * @async
 */
exports.delete = async dogId => {
    const data = await run(async () =>
        await db('dogBreeds').where({ dogId }).delete());
    return data;
}