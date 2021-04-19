'use strict';

const app = require('../app');
const server = app.listen(1234, () => {});

const request = require('supertest').agent(server);

beforeAll(() => {
	jest.spyOn(console, 'log').mockImplementation(() => {});
	jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterAll(() => {
	const { db } = require('../helpers/database');
	db.destroy();
	server.close();
});

describe('If-Modified-Since', () => {
	it('should return data normally if no conditional headers present', async () => {
		const res = await request.get('/api/v1/dogs/1');
		expect(res.status).toBe(200);
	});

	it('should return 304 if data has not been modified', async () => {
		const res = await request.get('/api/v1/dogs/1');
		expect(res.status).toBe(200);
		const { ['last-modified']: lastModified } = res.headers;
		const modifiedDate = new Date(Date.parse(lastModified));
		modifiedDate.setTime(modifiedDate.getTime() + 1000);

		const res2 = await request
			.get('/api/v1/dogs/1')
			.set({ 'If-Modified-Since': modifiedDate.toUTCString() });
		expect(res2.status).toBe(304);
	});

	it('should return 200 if data has been modified since', async () => {
		const res = await request.get('/api/v1/dogs/1');
		expect(res.status).toBe(200);
		const { ['last-modified']: lastModified } = res.headers;
		const modifiedDate = new Date(Date.parse(lastModified));
		modifiedDate.setTime(modifiedDate.getTime() - 1000);

		const res2 = await request
			.get('/api/v1/dogs/1')
			.set({ 'If-Modified-Since': modifiedDate.toUTCString() });
		expect(res2.status).toBe(200);
	});
});

describe('If-None-Match', () => {
	it('should return data normally if no conditional headers present', async () => {
		const res = await request.get('/api/v1/dogs');
		expect(res.status).toBe(200);
	});

	it('should return 304 if Etags match', async () => {
		const res = await request.get('/api/v1/dogs');
		expect(res.status).toBe(200);
		const { etag } = res.headers;

		const res2 = await request.get('/api/v1/dogs').set({ 'If-None-Match': etag });
		expect(res2.status).toBe(304);
	});

	it('should return 200 if Etags dont match', async () => {
		const res = await request.get('/api/v1/dogs').set({ 'If-None-Match': 'asd' });
		expect(res.status).toBe(200);
	});
});
