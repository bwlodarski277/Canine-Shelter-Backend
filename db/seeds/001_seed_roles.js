'use strict';

// eslint-disable-next-line no-unused-vars
const Knex = require('knex');

const roles = [{ name: 'user' }, { name: 'staff' }, { name: 'admin' }];

/**
 * Seeds the roles table.
 * @param {Knex} knex knex object to seed data
 */
exports.seed = knex => {
	return knex('roles')
		.delete()
		.then(() => knex('roles').insert(roles));
};
