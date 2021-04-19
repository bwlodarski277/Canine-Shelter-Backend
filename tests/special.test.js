'use strict';

const request = require('supertest');
const app = require('../app').callback();

beforeAll(() => {
	jest.spyOn(console, 'log').mockImplementation(() => {});
	jest.spyOn(console, 'error').mockImplementation(() => {});
});

describe('GET /', () => {
	it('should return a list of routes', async () => {
		const res = await request(app).get('/api/v1');
		expect(res.status).toBe(200);
		expect(res.body).toBeInstanceOf(Object);
	});
});
