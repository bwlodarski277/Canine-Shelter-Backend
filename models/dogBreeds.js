'use strict';

/**
 * @file Dog breeds model to manage interactions with the database.
 * @module models/dogBreeds
 * @author Bartlomiej Wlodarski
 */

const { db, run } = require('../helpers/database');

/**
 * Dog breed object returned from the DB.
 * @typedef {object} DogBreed
 * @property {number} dogId Dog ID (foreign key)
 * @property {number} breedId Breed ID (foreign key)
 */

/**
 * Gets a dog's breed(s) by their ID.
 * @param {number} dogId ID of the dog to fetch.
 * @returns {Promise<DogBreed>} database entry containing dog's breed.
 * @async
 */
exports.getByDogId = async dogId => {
	const [data] = await run(async () => await db('dogBreeds').where({ dogId }));
	return data;
};

// /**
//  * Gets all the dogs with a breed ID.
//  * @param {number} breedId ID of the breed to fetch.
//  * @returns {Promise<Array<DogBreed>>} list of all dogs of the given breed.
//  * @async
//  */
// exports.getByBreedId = async breedId => {
// 	const data = await run(async () => await db('dogBreeds').where({ breedId }));
// 	return data;
// };

/**
 * Gets all dog breed entries for a breed from the DB.
 * Allows for searching, filtering and sorting.
 * @param {number} breedId ID of the breed to fetch.
 * @param {number} page which page to get data from.
 * @param {number} limit number of items on a page.
 * @param {string} order what parameter to order by.
 * @param {'asc'|'desc'} direction direction to sort (asc. or desc.).
 * @returns {Promise<Array<Breed>>} array of all breed records.
 * @async
 */
exports.getByBreedId = async (breedId, query, page, limit, order, direction) => {
	const offset = (page - 1) * limit;
	const data = await run(
		async () =>
			await db('dogs')
				.join('dogBreeds', 'dogs.id', '=', 'dogBreeds.dogId')
				.where({ breedId })
				.andWhere(qry =>
					qry
						.where('name', 'like', `%${query}%`)
						.orWhere('description', 'like', `%${query}%`)
				)
				.orderBy(`dogs.${order}`, direction)
				.limit(limit)
				.offset(offset)
	);
	return data;
};

/**
 * Gets the number of dogs associated with the breed.
 * @param {number} breedId ID of the breed to fetch.
 * @returns {Promise<number>} number of items
 */
exports.getCount = async (breedId, query) => {
	const [{ data }] = await run(
		async () =>
			await db('dogs')
				.join('dogBreeds', 'dogs.id', '=', 'dogBreeds.dogId')
				.where({ breedId })
				.andWhere(qry =>
					qry
						.where('name', 'like', `%${query}%`)
						.orWhere('description', 'like', `%${query}%`)
				)
				.count({ data: '*' })
	);
	return data;
};

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
	await run(async () => await db('dogBreeds').insert({ dogId, breedId }));
	return true;
};

/**
 * Updates a breed entry in the DB.
 * @param {number} dogId ID of the dog to update.
 * @param {number} breedId ID to assign to the dog.
 * @returns {Promise<number>} number of updated rows (should be 1).
 * @async
 */
exports.update = async (dogId, breedId) => {
	const data = await run(async () => await db('dogBreeds').where({ dogId }).update({ breedId }));
	return data;
};

/**
 * Deletes a dog breed entry from the DB.
 * @param {number} dogId ID of dog that is having its breed removed.
 * @returns {Promise<number>} number of affected rows (should be 1).
 * @async
 */
exports.delete = async dogId => {
	const data = await run(async () => await db('dogBreeds').where({ dogId }).delete());
	return data;
};
