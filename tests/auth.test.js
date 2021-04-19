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

describe('GET /login', () => {
	it('should not allow unauthorised access', async () => {
		const res = await request(app).get('/api/v1/auth/login');
		expect(res.status).toEqual(401);
	});

	it('should allow users to view their ID', async () => {
		const res = await request(app)
			.get('/api/v1/auth/login')
			.set({ Authorization: `Basic ${btoa('TestUser:userPass')}` });
		expect(res.status).toEqual(200);
		expect(res.body).toMatchObject({ id: 1 });
	});

	it('should allow staff to view their ID', async () => {
		const res = await request(app)
			.get('/api/v1/auth/login')
			.set({ Authorization: `Basic ${btoa('TestStaff:staffPass')}` });
		expect(res.status).toEqual(200);
		expect(res.body).toMatchObject({ id: 2 });
	});

	it('should not allow invalid users', async () => {
		const res = await request(app)
			.get('/api/v1/auth/login')
			.set({ Authorization: `Basic ${btoa('UnknownUser:staffPass')}` });
		expect(res.status).toEqual(401);
	});

	it('should not allow invalid passwords', async () => {
		const res = await request(app)
			.get('/api/v1/auth/login')
			.set({ Authorization: `Basic ${btoa('TestUser:invalidPass')}` });
		expect(res.status).toBe(401);
	});

	it('should not allow invalid JWT', async () => {
		const res2 = await request(app).get('/api/v1/auth/login').set({
			// eslint-disable-next-line max-len
			Authorization: `Bearer byJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjIsIm5hbWUiOiJUZXN0U3RhZmYiLCJwcm92aWRlciI6ImxvY2FsIiwiaWF0IjoxNjE4ODM0NTYyLCJleHAiOjE2MTg4MzU0NjJ9.RU8MedEdSkON_Sze4UmRjvnIvfaACFAAEsJJXj8tnzA`
		});
		expect(res2.status).toBe(401);
	});
});

describe('/staff', () => {
	it('should not allow unauthorised access', async () => {
		const res = await request(app).get('/api/v1/auth/staff');
		expect(res.status).toEqual(401);
	});

	it('should only allow staff to view their staff ID', async () => {
		const res = await request(app)
			.get('/api/v1/auth/staff')
			.set({ Authorization: `Basic ${btoa('TestUser:userPass')}` });
		expect(res.status).toEqual(403);
	});

	it('should allow staff to view their staff ID', async () => {
		const res = await request(app)
			.get('/api/v1/auth/staff')
			.set({ Authorization: `Basic ${btoa('TestStaff:staffPass')}` });
		expect(res.status).toEqual(200);
		expect(res.body).toMatchObject({ staffId: 1 });
	});

	it('should check the staff is assigned to a location', async () => {
		const res = await request(app)
			.get('/api/v1/auth/staff')
			.set({ Authorization: `Basic ${btoa('TestStaff5:staffPass')}` });
		expect(res.status).toEqual(404);
	});
});

describe('GET /jwt', () => {
	it('should not allow unauthorised access', async () => {
		const res = await request(app).get('/api/v1/auth/jwt');
		expect(res.status).toEqual(401);
	});

	it('should generate a JSON Web Token', async () => {
		const res = await request(app)
			.get('/api/v1/auth/jwt')
			.set({ Authorization: `Basic ${btoa('TestUser:userPass')}` });
		expect(res.status).toBe(200);
		expect(Object.keys(res.body)).toContain('access');
		expect(Object.keys(res.body)).toContain('refresh');
	});

	it('should generate a working JWT', async () => {
		const res = await request(app)
			.get('/api/v1/auth/jwt')
			.set({ Authorization: `Basic ${btoa('TestUser:userPass')}` });
		expect(res.status).toBe(200);
		const { token } = res.body.access;

		const res2 = await request(app)
			.get('/api/v1/auth/login')
			.set({ Authorization: `Bearer ${token}` });
		expect(res2.status).toBe(200);
		expect(res2.body).toMatchObject({ id: 1 });
	});
});

describe('POST /jwt/refresh', () => {
	it('should generate new keys', async () => {
		const res = await request(app)
			.get('/api/v1/auth/jwt')
			.set({ Authorization: `Basic ${btoa('TestUser:userPass')}` });
		expect(res.status).toBe(200);
		const { token: refreshToken } = res.body.refresh;
		const res2 = await request(app)
			.post('/api/v1/auth/jwt/refresh')
			.send({ refresh: refreshToken });
		expect(res2.status).toBe(200);
	});

	it('should validate the refresh token', async () => {
		const res2 = await request(app)
			.post('/api/v1/auth/jwt/refresh')
			.send({ refresh: 'asdasdasd' });
		expect(res2.status).toBe(400);
	});
});
