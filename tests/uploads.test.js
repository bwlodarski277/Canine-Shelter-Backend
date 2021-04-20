'use strict';

const request = require('supertest');
const path = require('path');
const fs = require('fs');
const app = require('../app').callback();

const mockImg = 'c5c417e4-fe2f-4cc4-8572-e8290ef45349.png';
beforeAll(() => {
	// Mocking the filesystem seems to screw with mysql2.
	// I have searched every corner of the internet and haven't
	// found any solutions, so I'm just not mocking the fs.
	fs.copyFileSync(path.resolve(__dirname, 'dorime.png'), `/var/tmp/api/public/images/${mockImg}`);
	jest.spyOn(console, 'log').mockImplementation(() => {});
	jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterAll(() => {
	const { db } = require('../helpers/database');
	db.destroy();
});

describe('GET /{uuid}', () => {
	it('should return an image if image exists', async () => {
		const res = await request(app).get(`/api/v1/uploads/${mockImg}`);
		expect(res.status).toBe(200);
		expect(res.type).toBe('image/png');
	});

	it('should handle invalid image UUIDs', async () => {
		const res = await request(app).get(
			'/api/v1/uploads/f7fe872d-056b-470d-8c6c-4dc9fabb631e.png'
		);
		expect(res.status).toBe(404);
	});
});

describe('POST /', () => {
	it('should not allow unauthorised access', async () => {
		const res = await request(app).post('/api/v1/uploads');
		expect(res.status).toBe(401);
	});

	it('should allow users to upload images', async () => {
		const res = await request(app)
			.post('/api/v1/uploads')
			.set({ Authorization: `Basic ${btoa('TestUser:userPass')}` })
			.attach('upload', path.resolve(__dirname, 'dorime.png'));
		expect(res.status).toBe(201);
	});
});
