'use strict';

/**
 * @file Locations model to manage interactions with the database.
 * @module models/locations
 * @author Bartlomiej Wlodarski
 */

const { db, run } = require('../helpers/database');

/**
 * Location object returned from the DB.
 * @typedef {object} Location
 * @property {number} id Location ID
 * @property {string} name Location name
 * @property {string} address Location address
 */

/**
 * Gets all location entries from the DB.
 * Allows for searching, filtering and sorting.
 * @param {string} query search for dogs by name and description.
 * @param {number} page which page to get data from.
 * @param {number} limit number of items on a page.
 * @param {string} order what parameter to order by.
 * @param {'asc'|'desc'} direction direction to sort (asc. or desc.).
 * @returns {Promise<Array<Location>>} array of all location records.
 * @async
 */
exports.getAll = async (query, page, limit, order, direction) => {
	const offset = (page - 1) * limit;
	const data = await run(
		async () =>
			await db('locations')
				// Escaped by the driver
				.where('name', 'like', `%${query}%`)
				.orWhere('address', 'like', `%${query}%`)
				.orderBy(order, direction)
				.limit(limit)
				.offset(offset)
	);
	return data;
};

/**
 * Gets the number locations given a query.
 * @param {number} breedId ID of the breed to fetch.
 * @returns {Promise<number>} number of items
 */
exports.count = async query => {
	const [{ data }] = await run(
		async () =>
			await db('locations')
				.where('name', 'like', `%${query}%`)
				.orWhere('address', 'like', `%${query}%`)
				.count({ data: '*' })
	);
	return data;
};

/**
 * Gets a list of locations without a staff member assigned.
 * @returns {Promise<List<Location>>} list of free locations
 */
exports.getFree = async () => {
	const data = await run(
		async () =>
			await db('locations')
				.leftJoin('staff', 'locations.id', '=', 'staff.locationId')
				.select('locations.*')
				.where({ 'staff.locationId': null })
	);
	return data;
};

/**
 * Gets a single location entry from the DB by its ID.
 * @param {number} id ID of the location to fetch.
 * @returns {Promise<Location>} object containing the locations's record.
 * @async
 */
exports.getById = async id => {
	const [data] = await run(async () => await db('locations').where({ id }));
	return data;
};

/**
 * Creates a new location entry in the DB.
 * @param {Location} location location data to pass to the DB.
 * @returns {Promise<number>} ID of the newly inserted row.
 * @async
 */
exports.add = async location => {
	const [data] = await run(async () => await db('locations').insert(location));
	return data;
};

/**
 * Updates a location entry in the DB.
 * @param {number} id ID of the location to update.
 * @param {Location} location data to pass to the DB.
 * @returns {Promise<number>} number of updated rows (should be 1).
 * @async
 */
exports.update = async (id, location) => {
	const data = await run(async () => await db('locations').where({ id }).update(location));
	return data;
};

/**
 * Deletes a location entry from the DB.
 * @param {number} id ID of the location to delete.
 * @returns {Promise<number>} number of affected rows (should be 1).
 * @async
 */
exports.delete = async id => {
	const data = await run(async () => await db('locations').where({ id }).delete());
	return data;
};
