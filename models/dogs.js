'use strict';

/**
 * @file Dogs model to manage interactions with the database.
 * @module models/dogs
 * @author Bartlomiej Wlodarski
 */

const { db, run } = require('../helpers/database');

/**
 * Dog object returned from the DB.
 * @typedef {object} Dog
 * @property {number} id Dog ID
 * @property {string} name Dog name
 * @property {string} description Dog description
 * @property {number} age Dog age
 * @property {booolean} gender Dog gender (1 for male, 0 for female)
 * @property {string} dateCreated Dog entry creation date
 * @property {string} dateModified Dog entry modification date
 * @property {string} imageUrl Dog image URL
 */

/**
 * Get a list of dog entries from the DB.
 * Allows for searching, filtering and sorting.
 * @param {string} query search for dogs by name and description.
 * @param {Array<string>} select list of columns to select.
 * @param {number} page which page to get data from.
 * @param {number} limit number of items on a page.
 * @param {string} order what parameter to order by.
 * @param {'asc'|'desc'} direction direction to sort (asc. or desc.).
 * @returns {Promise<Array<Dog>>} array of selected dog records.
 * @async
 */
exports.getAll = async (query, select, page, limit, order, direction) => {
	const offset = (page - 1) * limit;
	const data = await run(
		async () =>
			await db('dogs')
				.select(...select)
				// Safe as it is escaped by driver
				.where('name', 'like', `%${query}%`)
				.orWhere('description', 'like', `%${query}%`)
				.orderBy(order, direction)
				.limit(limit)
				.offset(offset)
	);
	return data;
};

/**
 * Gets a single dog entry from the DB by their ID.
 * @param {number} id ID of the dog to fetch.
 * @param {Array<string>} select list of columns to select.
 * @returns {Promise<Dog>} object containing the dog's record.
 * @async
 */
exports.getById = async (id, select) => {
	const [data] = await run(
		async () =>
			await db('dogs')
				.where({ id })
				.select(...select)
	);
	return data;
};

/**
 * Creates a new dog entry in the DB.
 * @param {Dog} dog dog data to pass to the DB.
 * @returns {Promise<number>} ID of the newly inserted row.
 * @async
 */
exports.add = async dog => {
	const [data] = await run(async () => await db('dogs').insert(dog));
	return data;
};

/**
 * Updates a dog entry in the DB.
 * @param {number} id ID of the dog to update.
 * @param {Dog} dog data to pass to the DB.
 * @returns {Promise<number>} number of updated rows (should be 1).
 * @async
 */
exports.update = async (id, dog) => {
	const data = await run(async () => await db('dogs').where({ id }).update(dog));
	return data;
};

/**
 * Deletes a dog entry from the DB.
 * @param {number} id ID of the dog to delete.
 * @returns {Promise<number>} number of affected rows (should be 1).
 * @async
 */
exports.delete = async id => {
	const data = await run(async () => await db('dogs').where({ id }).delete());
	return data;
};
