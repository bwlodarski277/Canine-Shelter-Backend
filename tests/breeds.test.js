'use strict';

const request = require('supertest');
const app = require('../app').callback();

beforeAll(() => {
	jest.spyOn(console, 'log').mockImplementation(() => {});
	jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterAll(() => {
	const { db } = require('../helpers/database');
	db.destroy();
});

describe('GET /breeds', () => {
	it('should give status 200 an be an array', async () => {
		const res = await request(app).get('/api/v1/breeds');
		expect(res.status).toEqual(200);
		expect(res.body).toBeInstanceOf(Object);
		expect(Object.keys(res.body)).toContain('breeds');
	});

	it('should filter properly', async () => {
		const res = await request(app).get('/api/v1/breeds').query({ select: 'name' });
		expect(res.status).toBe(200);
		expect(res.body).toBeInstanceOf(Object);
		expect(Object.keys(res.body.breeds[0])).toContain('name');
	});

	it('should paginate properly', async () => {
		const res = await request(app).get('/api/v1/breeds').query({ limit: 1 });
		expect(res.status).toBe(200);
		expect(res.body.breeds).toHaveLength(1);
	});

	it('should handle sort direction', async () => {
		const res = await request(app).get('/api/v1/breeds').query({ direction: 'desc' });
		expect(res.body.breeds[0]).toMatchObject({ id: 3 });
	});

	it('should handle invalid requests', async () => {
		const res = await request(app).get('/api/v1/breeds').query({ select: 'invalid' });
		expect(res.status).toBe(200);
		expect(Object.keys(res.body)).not.toContain('invalid');
	});

	it('should allow returning all records if limit is 0', async () => {
		const res = await request(app).get('/api/v1/breeds').query({ limit: 0 });
		expect(res.status).toBe(200);
	});
});

describe('GET /breeds/{id}', () => {
	it('should get a valid breed entry', async () => {
		const res = await request(app).get('/api/v1/breeds/1');
		expect(res.status).toBe(200);
		expect(res.body).toBeInstanceOf(Object);
		expect(res.body).toMatchObject({ name: 'Golden Retriever' });
	});

	it('should handle nonexistent breed entry', async () => {
		const res = await request(app).get('/api/v1/breeds/100');
		expect(res.status).toBe(404);
	});

	it('should handle no filters', async () => {
		const res = await request(app).get('/api/v1/breeds/1');
		expect(res.status).toBe(200);
		expect(Object.keys(res.body)).toContain('name');
	});

	it('should handle valid filters', async () => {
		const res = await request(app).get('/api/v1/breeds/1').query({ select: 'name' });
		expect(res.status).toBe(200);
		expect(Object.keys(res.body)).toContain('name');
		expect(Object.keys(res.body)).not.toContain('description');
	});

	it('should handle invalid filters', async () => {
		const res = await request(app).get('/api/v1/breeds/1').query({ select: 'invalid' });
		expect(res.status).toBe(200);
		expect(Object.keys(res.body)).not.toContain('name');
	});
});

describe('GET /breeds/{id}/dogs', () => {
	it('should get a list of breed dogs', async () => {
		const res = await request(app).get('/api/v1/breeds/1/dogs');
		expect(res.status).toBe(200);
		expect(res.body).toBeInstanceOf(Object);
	});

	it('should handle selection arguments', async () => {
		const res = await request(app).get('/api/v1/breeds/1/dogs').query({ select: 'name' });
		expect(res.status).toBe(200);
		expect(Object.keys(res.body.dogs[0])).toContain('name');
	});

	it('should handle nonexistent breeds', async () => {
		const res = await request(app).get('/api/v1/breeds/100/dogs');
		expect(res.status).toBe(404);
	});
});

describe('POST /breeds', () => {
	it('should require authentication', async () => {
		const res = await request(app)
			.post('/api/v1/breeds')
			.send({ name: 'test', description: 'test' });
		expect(res.status).toBe(401);
	});

	it('should accept Basic auth, but reject users', async () => {
		const res = await request(app)
			.post('/api/v1/breeds')
			.set({ Authorization: `Basic ${btoa('TestUser:userPass')}` })
			.send({ name: 'test', description: 'test' });
		expect(res.status).toBe(403);
	});

	it('should accept Basic auth, and accept staff', async () => {
		const res = await request(app)
			.post('/api/v1/breeds')
			.set({ Authorization: `Basic ${btoa('TestStaff:staffPass')}` })
			.send({ name: 'test', description: 'test' });
		expect(res.status).toBe(201);
		expect(res.body).toMatchObject({ created: true });
	});

	it('should return an error if schema is incorrect', async () => {
		const res = await request(app)
			.post('/api/v1/breeds')
			.set({ Authorization: `Basic ${btoa('TestStaff:staffPass')}` })
			.send({ invalid: 'value' });
		expect(res.status).toBe(400);
	});
});

describe('PUT /breeds{id}', () => {
	it('should require authentication', async () => {
		const res = await request(app)
			.put('/api/v1/breeds/1')
			.send({ name: 'test', description: 'test' });
		expect(res.status).toBe(401);
	});

	it('should accept Basic auth, but reject users', async () => {
		const res = await request(app)
			.put('/api/v1/breeds/1')
			.set({ Authorization: `Basic ${btoa('TestUser:userPass')}` })
			.send({ name: 'test', description: 'test' });
		expect(res.status).toBe(403);
	});

	it('should accept Basic auth, and accept staff', async () => {
		const res = await request(app)
			.put('/api/v1/breeds/1')
			.set({ Authorization: `Basic ${btoa('TestStaff:staffPass')}` })
			.send({ name: 'test', description: 'test' });
		expect(res.status).toBe(200);
		expect(res.body).toMatchObject({ updated: true });
	});

	it('should accept Basic auth, check if breed is valid', async () => {
		const res = await request(app)
			.put('/api/v1/breeds/100')
			.set({ Authorization: `Basic ${btoa('TestStaff:staffPass')}` })
			.send({ name: 'test', description: 'test' });
		expect(res.status).toBe(404);
	});
});

describe('DEL /breeds/{id}', () => {
	it('should require authentication', async () => {
		const res = await request(app).del('/api/v1/breeds/1');
		expect(res.status).toBe(401);
	});

	it('should accept Basic auth, but reject users', async () => {
		const res = await request(app)
			.del('/api/v1/breeds/1')
			.set({ Authorization: `Basic ${btoa('TestUser:userPass')}` });
		expect(res.status).toBe(403);
	});

	it('should accept Basic auth, and accept staff', async () => {
		const res = await request(app)
			.del('/api/v1/breeds/1')
			.set({ Authorization: `Basic ${btoa('TestStaff:staffPass')}` });
		expect(res.status).toBe(200);
		expect(res.body).toMatchObject({ deleted: true });
	});

	it('should accept Basic auth, check if breed is valid', async () => {
		const res = await request(app)
			.del('/api/v1/breeds/100')
			.set({ Authorization: `Basic ${btoa('TestStaff:staffPass')}` });
		expect(res.status).toBe(404);
	});
});
