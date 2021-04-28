'use strict';

// eslint-disable-next-line no-unused-vars
const Knex = require('knex');
const bcrypt = require('bcryptjs');

const users = [
	{
		// 1
		role: 'user',
		username: 'TestUser',
		email: 'user1@example.com',
		password: bcrypt.hashSync('userPass', 10),
		firstName: 'Test',
		lastName: 'User'
	},
	{
		// 2
		role: 'staff',
		username: 'TestStaff',
		email: 'staff1@example.com',
		password: bcrypt.hashSync('staffPass', 10),
		firstName: 'Test',
		lastName: 'Staff',
		imageUrl: 'someUrl'
	},
	{
		// 3
		role: 'staff',
		username: 'TestStaff2',
		email: 'staff2@example.com',
		password: bcrypt.hashSync('staffPass2', 10),
		firstName: 'Another',
		lastName: 'Staff',
		imageUrl: 'photoUrl'
	},
	{
		// 4
		role: 'admin',
		username: 'TestAdmin',
		email: 'admin1@example.com',
		password: bcrypt.hashSync('adminPass', 10),
		firstName: 'Test',
		lastName: 'Admin',
		imageUrl: 'anotherUrl'
	},
	{
		// 5
		role: 'user',
		username: 'TestUser2',
		email: 'user4@example.com',
		password: bcrypt.hashSync('userPass2', 10),
		firstName: 'Another',
		lastName: 'User'
	},
	{
		// 6
		role: 'user',
		username: 'TestUser3',
		email: 'user5@example.com',
		password: bcrypt.hashSync('userPass3', 10),
		firstName: 'Another',
		lastName: 'User'
	},
	{
		// 7
		role: 'staff',
		username: 'TestStaff3',
		email: 'staff3@example.com',
		password: bcrypt.hashSync('staffPass', 10),
		firstName: 'Another',
		lastName: 'User'
	},
	{
		// 8
		role: 'staff',
		username: 'TestStaff4',
		email: 'staff444@example.com',
		password: bcrypt.hashSync('staffPass', 10),
		firstName: 'Another',
		lastName: 'Staff'
	},
	{
		// 9
		role: 'staff',
		username: 'TestStaff5',
		email: 'staff555@example.com',
		password: bcrypt.hashSync('staffPass', 10),
		firstName: 'Another',
		lastName: 'Staff'
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
