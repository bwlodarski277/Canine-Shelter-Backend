'use strict';

/**
 * @file Breeds model to manage interactions with the database.
 * @module models/breeds
 * @author Bartlomiej Wlodarski
 */

const { db, run } = require('../helpers/database');

/**
 * Breed object returned from the DB.
 * @typedef {object} Breed
 * @property {number} id Breed ID
 * @property {string} name Name of the breed
 * @property {string} description Breed description
 */

//  * @param {Array<string>} select list of columns to select.
/**
 * Gets all breed entries from the DB.
 * Allows for searching, filtering and sorting.
 * @param {string} query search for breeds by name and description.
 * @param {number} page which page to get data from.
 * @param {number} limit number of items on a page.
 * @param {string} order what parameter to order by.
 * @param {'asc'|'desc'} direction direction to sort (asc. or desc.).
 * @returns {Promise<Array<Breed>>} array of all breed records.
 * @async
 */
exports.getAll = async (query, page, limit, order, direction) => {
	const offset = (page - 1) * limit;
	const data = await run(
		async () =>
			await db('breeds')
				.where('name', 'like', `%${query}%`)
				.orWhere('description', 'like', `%${query}%`)
				.orderBy(order, direction)
				.limit(limit)
				.offset(offset)
	);
	return data;
};

/**
 * Gets a single breed entry from the DB by its ID.
 * @param {number} id ID of the breed to fetch.
 * @returns {Promise<Breed>} object containing the breed record.
 * @async
 */
exports.getById = async id => {
	const [data] = await run(async () => await db('breeds').where({ id }));
	return data;
};

/**
 * Creates a new breed entry in the DB.
 * @param {object} breed breed data to pass to the DB.
 * @returns {Promise<number>} ID of newly inserted row.
 * @async
 */
exports.add = async breed => {
	const [data] = await run(async () => await db('breeds').insert(breed));
	return data;
};

/**
 * Updates a breed entry in the DB.
 * @param {number} id ID of the breed to update.
 * @param {object} breed data to pass to the DB.
 * @returns {Promise<number>} number of updated rows (should be 1).
 * @async
 */
exports.update = async (id, breed) => {
	const data = await run(async () => await db('breeds').where({ id }).update(breed));
	return data;
};

/**
 * Deletes a breed entry from the DB.
 * @param {number} id ID of the breed to delete.
 * @returns {Promise<number>} number of affected rows (should be 1).
 * @async
 */
exports.delete = async id => {
	const data = await run(async () => await db('breeds').where({ id }).delete());
	return data;
};
