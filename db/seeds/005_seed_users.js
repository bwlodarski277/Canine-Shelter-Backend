'use strict';

// eslint-disable-next-line no-unused-vars
const Knex = require('knex');
const bcrypt = require('bcrypt');

const users = [
	{
		role: 'user',
		username: 'TestUser',
		email: 'user1@example.com',
		password: bcrypt.hashSync('userPass', 10),
		firstName: 'Test',
		lastName: 'User'
	},
	{
		role: 'staff',
		username: 'TestStaff',
		email: 'staff1@example.com',
		password: bcrypt.hashSync('staffPass', 10),
		firstName: 'Test',
		lastName: 'Staff',
		imageUrl: 'someUrl'
	},
	{
		role: 'staff',
		username: 'TestStaff2',
		email: 'staff2@example.com',
		password: bcrypt.hashSync('staffPass2', 10),
		firstName: 'Another',
		lastName: 'Staff',
		imageUrl: 'photoUrl'
	},
	{
		role: 'admin',
		username: 'TestAdmin',
		email: 'admin1@example.com',
		password: bcrypt.hashSync('adminPass', 10),
		firstName: 'Test',
		lastName: 'Admin',
		imageUrl: 'anotherUrl'
	},
	{
		role: 'user',
		username: 'TestUser2',
		email: 'user2@example.com',
		password: bcrypt.hashSync('userPass2', 10),
		firstName: 'Another',
		lastName: 'User'
	}
];

/**
 * Seeds the users table.
 * @param {Knex} knex knex object to seed data
 */
exports.seed = knex => {
	return knex('users')
		.delete()
		.then(() => knex('users').insert(users));
};
