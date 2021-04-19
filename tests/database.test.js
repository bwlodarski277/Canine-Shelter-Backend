'use strict';

const { run, db } = require('../helpers/database');

beforeAll(() => {
	jest.spyOn(console, 'log').mockImplementation(() => {});
	jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterAll(() => {
	db.destroy();
});

describe('Database Handler', () => {
	it('should return data properly', async () => {
		const users = await run(async () => await db('users'));
		expect(users).toBeInstanceOf(Array);
	});

	it('should hanle invalid syntax', async () => {
		const databaseQuery = async () => {
			await run(async () => await db('asdasd'));
		};
		await expect(databaseQuery).rejects.toThrow();
	});
});
