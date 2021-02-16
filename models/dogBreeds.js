const { db, run } = require('../helpers/database');

/**
 * Gets a dog's breed(s) by their ID.
 * @param {number} dogId ID of the dog to fetch.
 */
exports.getByDogId = async dogId => {
    const [data] = await run(async () =>
        await db('dogBreeds').where({ dogId }));
    return data;
}

/**
 * Gets all the dogs with a breed ID.
 * @param {number} breedId ID of the breed to fetch.
 */
exports.getByBreedId = async breedId => {
    const data = await run(async () =>
        await db('dogBreeds').where({ breedId }));
    return data;
}

/**
 * Creates a new breed entry in the DB.
 * @param {Object} breed breed data to pass to the DB.
 */
exports.add = async (dogId, breedId) => {
    const data = await run(async () =>
        await db('dogBreeds').insert({ dogId, breedId }));
    return data;
}

/**
 * Updates a breed entry in the DB.
 * @param {number} dogId ID of the dog to update
 * @param {number} breedId ID to assign to the dog
 */
exports.update = async (dogId, breedId) => {
    const data = await run(async () =>
        await db('dogBreeds').where({ dogId }).update({ breedId }));
    return data;
}

/**
 * Deletes a dog breed entry from the DB.
 * @param {Object} id ID of the breed to delete
 */
exports.delete = async dogId => {
    const data = await run(async () =>
        await db('dogBreeds').where({ dogId }).delete());
    return data;
}