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
	it('Should give status 200 an be an array', async () => {
		const res = await request(app).get('/api/v1/breeds');
		expect(res.status).toEqual(200);
		expect(res.body).toBeInstanceOf(Array);
	});

	it('Should filter properly', async () => {
		const res = await request(app).get('/api/v1/breeds').query({ select: 'name' });
		expect(res.status).toBe(200);
		expect(res.body).toBeInstanceOf(Array);
		expect(res.body).toContainEqual({ name: 'Golden Retriever' });
	});

	it('Should paginate properly', async () => {
		const res = await request(app).get('/api/v1/breeds').query({ limit: 1 });
		expect(res.status).toBe(200);
		expect(res.body).toHaveLength(1);
	});

	it('Should handle sort direction', async () => {
		const res = await request(app).get('/api/v1/breeds').query({ direction: 'desc' });
		expect(res.body[0]).toMatchObject({ id: 3 });
	});

	it('Should handle invalid requests', async () => {
		const res = await request(app).get('/api/v1/breeds').query({ select: 'invalid' });
		expect(res.status).toBe(400);
	});
});

describe('GET /breeds/{id}', () => {
	it('Should get a valid breed entry', async () => {
		const res = await request(app).get('/api/v1/breeds/1');
		expect(res.status).toBe(200);
		expect(res.body).toBeInstanceOf(Object);
		expect(res.body).toMatchObject({ name: 'Golden Retriever' });
	});

	it('Should handle nonexistent breed entry', async () => {
		const res = await request(app).get('/api/v1/breeds/100');
		expect(res.status).toBe(404);
	});
});

describe('GET /breeds/{id}/dogs', () => {
	it('Should get a list of dog breeds', async () => {
		const res = await request(app).get('/api/v1/breeds/1/dogs');
		expect(res.status).toBe(200);
		expect(res.body).toBeInstanceOf(Array);
	});

	it('Should handle nonexistent breeds', async () => {
		const res = await request(app).get('/api/v1/breeds/100/dogs');
		expect(res.status).toBe(404);
	});
});

describe('POST /breeds', () => {
	it('Should require authentication', async () => {
		const res = await request(app)
			.post('/api/v1/breeds')
			.send({ name: 'test', description: 'test' });
		expect(res.status).toBe(401);
	});

	it('Should accept Basic auth, but reject users', async () => {
		const res = await request(app)
			.post('/api/v1/breeds')
			.set({ Authorization: `Basic ${btoa('TestUser:userPass')}` })
			.send({ name: 'test', description: 'test' });
		expect(res.status).toBe(403);
	});

	it('Should accept Basic auth, and accept staff', async () => {
		const res = await request(app)
			.post('/api/v1/breeds')
			.set({ Authorization: `Basic ${btoa('TestStaff:staffPass')}` })
			.send({ name: 'test', description: 'test' });
		expect(res.status).toBe(201);
		expect(res.body).toMatchObject({ created: true });
	});

	it('Should return an error if schema is incorrect', async () => {
		const res = await request(app)
			.post('/api/v1/breeds')
			.set({ Authorization: `Basic ${btoa('TestStaff:staffPass')}` })
			.send({ invalid: 'value' });
		expect(res.status).toBe(400);
	});
});

describe('PUT /breeds{id}', () => {
	it('Should require authentication', async () => {
		const res = await request(app)
			.put('/api/v1/breeds/1')
			.send({ name: 'test', description: 'test' });
		expect(res.status).toBe(401);
	});

	it('Should accept Basic auth, but reject users', async () => {
		const res = await request(app)
			.put('/api/v1/breeds/1')
			.set({ Authorization: `Basic ${btoa('TestUser:userPass')}` })
			.send({ name: 'test', description: 'test' });
		expect(res.status).toBe(403);
	});

	it('Should accept Basic auth, and accept staff', async () => {
		const res = await request(app)
			.put('/api/v1/breeds/1')
			.set({ Authorization: `Basic ${btoa('TestStaff:staffPass')}` })
			.send({ name: 'test', description: 'test' });
		expect(res.status).toBe(200);
		expect(res.body).toMatchObject({ updated: true });
	});

	it('Should accept Basic auth, check if breed is valid', async () => {
		const res = await request(app)
			.put('/api/v1/breeds/100')
			.set({ Authorization: `Basic ${btoa('TestStaff:staffPass')}` })
			.send({ name: 'test', description: 'test' });
		expect(res.status).toBe(404);
	});
});

describe('DEL /breeds/{id}', () => {
	it('Should require authentication', async () => {
		const res = await request(app).del('/api/v1/breeds/1');
		expect(res.status).toBe(401);
	});

	it('Should accept Basic auth, but reject users', async () => {
		const res = await request(app)
			.del('/api/v1/breeds/1')
			.set({ Authorization: `Basic ${btoa('TestUser:userPass')}` });
		expect(res.status).toBe(403);
	});

	it('Should accept Basic auth, and accept staff', async () => {
		const res = await request(app)
			.del('/api/v1/breeds/1')
			.set({ Authorization: `Basic ${btoa('TestStaff:staffPass')}` });
		expect(res.status).toBe(200);
		expect(res.body).toMatchObject({ deleted: true });
	});

	it('Should accept Basic auth, check if breed is valid', async () => {
		const res = await request(app)
			.del('/api/v1/breeds/100')
			.set({ Authorization: `Basic ${btoa('TestStaff:staffPass')}` });
		expect(res.status).toBe(404);
	});
});
