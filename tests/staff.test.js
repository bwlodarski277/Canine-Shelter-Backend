'use strict';

const request = require('supertest');
const { config } = require('../config');
const app = require('../app').callback();

beforeAll(() => {
	jest.spyOn(console, 'log').mockImplementation(() => {});
	jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterAll(() => {
	const { db } = require('../helpers/database');
	db.destroy();
});

describe('GET /staff', () => {
	it('should not allow unauthorised access', async () => {
		const res = await request(app).get('/api/v1/staff');
		expect(res.status).toBe(401);
	});

	it('should not allow users to view staff list', async () => {
		const res = await request(app)
			.get('/api/v1/staff')
			.set({ Authorization: `Basic ${btoa('TestUser:userPass')}` });
		expect(res.status).toBe(403);
	});

	it('should allow staff to view staff list', async () => {
		const res = await request(app)
			.get('/api/v1/staff')
			.set({ Authorization: `Basic ${btoa('TestStaff:staffPass')}` });
		expect(res.status).toBe(200);
		expect(res.body).toBeInstanceOf(Array);
	});
});

describe('GET /staff/{id}', () => {
	it('should not allow unauthorised access', async () => {
		const res = await request(app).get('/api/v1/staff/1');
		expect(res.status).toBe(401);
	});

	it('should not allow users to view staff', async () => {
		const res = await request(app)
			.get('/api/v1/staff/1')
			.set({ Authorization: `Basic ${btoa('TestUser:userPass')}` });
		expect(res.status).toBe(403);
	});

	it('should allow staff to view staff', async () => {
		const res = await request(app)
			.get('/api/v1/staff/1')
			.set({ Authorization: `Basic ${btoa('TestStaff:staffPass')}` });
		expect(res.status).toBe(200);
		expect(res.body).toBeInstanceOf(Object);
	});

	it('should check if the staff exists', async () => {
		const res = await request(app)
			.get('/api/v1/staff/100')
			.set({ Authorization: `Basic ${btoa('TestStaff:staffPass')}` });
		expect(res.status).toBe(404);
	});
});

describe('POST /staff', () => {
	it('should not allow unauthorised access', async () => {
		const res = await request(app).post('/api/v1/staff');
		expect(res.status).toBe(401);
	});

	it('should not allow users to assign locations', async () => {
		const res = await request(app)
			.post('/api/v1/staff')
			.set({ Authorization: `Basic ${btoa('TestUser:userPass')}` })
			.send({
				locationId: 5,
				staffKey: config.staffKey
			});
		expect(res.status).toBe(403);
	});

	it('should not staff to assign themselves to taken locations', async () => {
		const res = await request(app)
			.post('/api/v1/staff')
			.set({ Authorization: `Basic ${btoa('TestStaff4:staffPass')}` })
			.send({
				locationId: 1,
				staffKey: config.staffKey
			});
		expect(res.status).toBe(400);
	});

	it('should allow staff to register to an empty location', async () => {
		const res = await request(app)
			.post('/api/v1/staff')
			.set({ Authorization: `Basic ${btoa('TestStaff4:staffPass')}` })
			.send({
				locationId: 5,
				staffKey: config.staffKey
			});
		expect(res.status).toBe(201);
	});

	it('should check if the location exists', async () => {
		const res = await request(app)
			.post('/api/v1/staff')
			.set({ Authorization: `Basic ${btoa('TestStaff4:staffPass')}` })
			.send({
				locationId: 100,
				staffKey: config.staffKey
			});
		expect(res.status).toBe(404);
	});
});

describe('PUT /staff/{id}', () => {
	it('should not allow unauthorised access', async () => {
		const res = await request(app).put('/api/v1/staff/4');
		expect(res.status).toBe(401);
	});

	it('should not allow users to update staff', async () => {
		const res = await request(app)
			.put('/api/v1/staff/4')
			.set({ Authorization: `Basic ${btoa('TestUser:userPass')}` })
			.send({ locationId: 6 });
		expect(res.status).toBe(403);
	});

	it('should not allow staff to update staff at other locations', async () => {
		const res = await request(app)
			.put('/api/v1/staff/3')
			.set({ Authorization: `Basic ${btoa('TestStaff:staffPass')}` })
			.send({ locationId: 6 });
		expect(res.status).toBe(403);
	});

	it('should check if the staff exists', async () => {
		const res = await request(app)
			.put('/api/v1/staff/100')
			.set({ Authorization: `Basic ${btoa('TestStaff:staffPass')}` })
			.send({ locationId: 6 });
		expect(res.status).toBe(404);
	});

	it('should not allow staff to change location to a taken location', async () => {
		const res = await request(app)
			.put('/api/v1/staff/4')
			.set({ Authorization: `Basic ${btoa('TestStaff4:staffPass')}` })
			.send({ locationId: 1 });
		expect(res.status).toBe(400);
	});

	it('should allow staff to update their own staff record', async () => {
		const res = await request(app)
			.put('/api/v1/staff/4')
			.set({ Authorization: `Basic ${btoa('TestStaff4:staffPass')}` })
			.send({ locationId: 6 });
		expect(res.status).toBe(200);
	});
});

describe('DEL /staff/{id}', () => {
	it('should not allow unauthorised access', async () => {
		const res = await request(app).del('/api/v1/staff/4');
		expect(res.status).toBe(401);
	});

	it('should not allow users to delete staff', async () => {
		const res = await request(app)
			.del('/api/v1/staff/4')
			.set({ Authorization: `Basic ${btoa('TestUser:userPass')}` });
		expect(res.status).toBe(403);
	});

	it('should not allow staff to delete staff at other locations', async () => {
		const res = await request(app)
			.del('/api/v1/staff/3')
			.set({ Authorization: `Basic ${btoa('TestStaff:staffPass')}` });
		expect(res.status).toBe(403);
	});

	it('should not allow staff to delete staff at other locations', async () => {
		const res = await request(app)
			.del('/api/v1/staff/3')
			.set({ Authorization: `Basic ${btoa('TestStaff:staffPass')}` });
		expect(res.status).toBe(403);
	});

	it('should check if the staff exists', async () => {
		const res = await request(app)
			.del('/api/v1/staff/100')
			.set({ Authorization: `Basic ${btoa('TestStaff:staffPass')}` });
		expect(res.status).toBe(404);
	});

	it('should allow staff to delete their own staff record', async () => {
		const res = await request(app)
			.del('/api/v1/staff/4')
			.set({ Authorization: `Basic ${btoa('TestStaff4:staffPass')}` });
		expect(res.status).toBe(200);
	});
});
