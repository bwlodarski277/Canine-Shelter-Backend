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

describe('GET /users', () => {
	it('Should not allow un-authenticated users', async () => {
		const res = await request(app).get('/api/v1/users');
		expect(res.status).toBe(401);
	});

	it('Should not allow regular users', async () => {
		const res = await request(app)
			.get('/api/v1/users')
			.set({ Authorization: `Basic ${btoa('TestUser:userPass')}` });
		expect(res.status).toBe(403);
	});

	it('Should allow staff to view users', async () => {
		const res = await request(app)
			.get('/api/v1/users')
			.set({ Authorization: `Basic ${btoa('TestStaff:staffPass')}` });
		expect(res.status).toBe(200);
		expect(res.body).toBeInstanceOf(Array);
		// Making sure each user record has no password
		res.body.map(user => expect(Object.keys(user)).not.toContain('password'));
	});

	it('Should choose sorting direction accordingly', async () => {
		const res = await request(app)
			.get('/api/v1/users')
			.query({ direction: 'desc' })
			.set({ Authorization: `Basic ${btoa('TestStaff:staffPass')}` });
		expect(res.status).toBe(200);
		expect(res.body).toBeInstanceOf(Array);
		expect(res.body[0]).toMatchObject({ id: 5 });
	});

	it('Should filter data correctly', async () => {
		const res = await request(app)
			.get('/api/v1/users')
			.query({ select: 'username' })
			.set({ Authorization: `Basic ${btoa('TestStaff:staffPass')}` });
		expect(res.status).toBe(200);
		expect(res.body).toBeInstanceOf(Array);
		// Making sure each item in users array only has username
		res.body.map(user => expect(Object.keys(user)).toEqual(['username']));
	});

	it('Should handle invalid filters properly', async () => {
		const res = await request(app)
			.get('/api/v1/users')
			.query({ select: 'invalid' })
			.set({ Authorization: `Basic ${btoa('TestStaff:staffPass')}` });
		expect(res.status).toEqual(400);
	});
});

describe('GET /users/{id}', () => {
	it('Should not allow unauthorised users', async () => {
		const res = await request(app).get('/api/v1/users/1');
		expect(res.status).toEqual(401);
	});

	it('Should not allow users to view other user records', async () => {
		const res = await request(app)
			.get('/api/v1/users/2')
			.set({ Authorization: `Basic ${btoa('TestUser:userPass')}` });
		expect(res.status).toEqual(403);
	});

	it('Should allow users to view their own records', async () => {
		const res = await request(app)
			.get('/api/v1/users/1')
			.set({ Authorization: `Basic ${btoa('TestUser:userPass')}` });
		expect(res.status).toEqual(200);
		expect(res.body).toBeInstanceOf(Object);
		expect(res.body).not.toContain('password');
	});

	it('Should allow staff to access any records', async () => {
		const res = await request(app)
			.get('/api/v1/users/1')
			.set({ Authorization: `Basic ${btoa('TestStaff:staffPass')}` });
		expect(res.status).toEqual(200);
	});

	it('Should handle filtering properly', async () => {
		const res = await request(app)
			.get('/api/v1/users/1')
			.query({ select: 'invalid' })
			.set({ Authorization: `Basic ${btoa('TestUser:userPass')}` });
		expect(res.status).toEqual(400);
	});

	it('Should handle invalid users', async () => {
		const res = await request(app)
			.get('/api/v1/users/100')
			.set({ Authorization: `Basic ${btoa('TestStaff:staffPass')}` });
		expect(res.status).toBe(404);
	});
});

describe('GET /users/{id}/favourites', () => {
	it('Should allow only authenticated users', async () => {
		const res = await request(app).get('/api/v1/users/1/favourites');
		expect(res.status).toBe(401);
	});

	it('Should allow users to view their own', async () => {
		const res = await request(app)
			.get('/api/v1/users/1/favourites')
			.set({ Authorization: `Basic ${btoa('TestUser:userPass')}` });
		expect(res.status).toBe(200);
		expect(res.body).toBeInstanceOf(Array);
		expect(res.body.length).toBe(1);
	});

	it('Should prevent users from viewing others', async () => {
		const res = await request(app)
			.get('/api/v1/users/2/favourites')
			.set({ Authorization: `Basic ${btoa('TestUser:userPass')}` });
		expect(res.status).toBe(403);
	});

	it('Should allow staff to view any record', async () => {
		const res = await request(app)
			.get('/api/v1/users/1/favourites')
			.set({ Authorization: `Basic ${btoa('TestStaff:staffPass')}` });
		expect(res.status).toBe(200);
	});

	it('Should handle invalid user IDs', async () => {
		const res = await request(app)
			.get('/api/v1/users/100/favourites')
			.set({ Authorization: `Basic ${btoa('TestStaff:staffPass')}` });
		expect(res.status).toBe(404);
	});
});

describe('GET /users/{id}/favourites/{favId}', () => {
	it('Should allow only authenticated users', async () => {
		const res = await request(app).get('/api/v1/users/1/favourites/1');
		expect(res.status).toBe(401);
	});

	it('Should allow users to view their own', async () => {
		const res = await request(app)
			.get('/api/v1/users/1/favourites/1')
			.set({ Authorization: `Basic ${btoa('TestUser:userPass')}` });
		expect(res.status).toBe(200);
		expect(res.body).toBeInstanceOf(Object);
	});

	it('Should prevent users from viewing others', async () => {
		const res = await request(app)
			.get('/api/v1/users/2/favourites/2')
			.set({ Authorization: `Basic ${btoa('TestUser:userPass')}` });
		expect(res.status).toBe(403);
	});

	it('Should allow staff to view any record', async () => {
		const res = await request(app)
			.get('/api/v1/users/1/favourites/1')
			.set({ Authorization: `Basic ${btoa('TestStaff:staffPass')}` });
		expect(res.status).toBe(200);
	});

	it('Should handle invalid user IDs', async () => {
		const res = await request(app)
			.get('/api/v1/users/100/favourites/1')
			.set({ Authorization: `Basic ${btoa('TestStaff:staffPass')}` });
		expect(res.status).toBe(404);
		const res2 = await request(app)
			.get('/api/v1/users/1/favourites/100')
			.set({ Authorization: `Basic ${btoa('TestStaff:staffPass')}` });
		expect(res2.status).toBe(404);
	});
});

describe('GET /users/{id}/chats', () => {
	it('Should allow only authenticated users', async () => {
		const res = await request(app).get('/api/v1/users/1/chats');
		expect(res.status).toBe(401);
	});

	it('Should allow users to view their own', async () => {
		const res = await request(app)
			.get('/api/v1/users/1/chats')
			.set({ Authorization: `Basic ${btoa('TestUser:userPass')}` });
		expect(res.status).toBe(200);
		expect(res.body).toBeInstanceOf(Array);
	});

	it('Should prevent users from viewing others', async () => {
		const res = await request(app)
			.get('/api/v1/users/2/chats')
			.set({ Authorization: `Basic ${btoa('TestUser:userPass')}` });
		expect(res.status).toBe(403);
	});

	it('Should check if the user exists', async () => {
		const res = await request(app)
			.get('/api/v1/users/100/chats')
			.set({ Authorization: `Basic ${btoa('TestUser:userPass')}` });
		expect(res.status).toBe(404);
	});
});

describe('POST /users', () => {
	it('Should allow users to register', async () => {
		const res = await request(app).post('/api/v1/users').send({
			username: 'UnitTestUser',
			email: 'unittest@email.com',
			password: 'UnitTestPassword',
			firstName: 'Test',
			lastName: 'User'
		});
		expect(res.status).toBe(201);
	});

	it('Should show an error if username is taken', async () => {
		const res = await request(app).post('/api/v1/users').send({
			username: 'TestUser',
			email: 'unittest1@email.com',
			password: 'UnitTestPassword',
			firstName: 'Test',
			lastName: 'User'
		});
		expect(res.status).toBe(400);
	});

	it('Should show an error if email is taken', async () => {
		const res = await request(app).post('/api/v1/users').send({
			username: 'UnitTestUser2',
			email: 'user1@example.com',
			password: 'UnitTestPassword',
			firstName: 'Test',
			lastName: 'User'
		});
		expect(res.status).toBe(400);
	});

	it('Should validate the schema properly', async () => {
		const res = await request(app).post('/api/v1/users').send({
			username: 'UnitTestUser'
		});
		expect(res.status).toBe(400);
	});

	it('Should allow users to register as staff', async () => {
		const res = await request(app).post('/api/v1/users').send({
			username: 'UnitTestStaff',
			email: 'staff22@test.com',
			password: 'UnitTestPassword',
			firstName: 'Test',
			lastName: 'User',
			staffKey: config.staffKey
		});
		expect(res.status).toBe(201);
		const { id } = res.body;
		const res2 = await request(app)
			.get(`/api/v1/users/${id}`)
			.set({ Authorization: `Basic ${btoa('UnitTestStaff:UnitTestPassword')}` });
		expect(res2.status).toBe(200);
		expect(res2.body).toMatchObject({ role: 'staff' });
	});
});

describe('POST /users/{id}/favourites', () => {
	it('Should prevent unauthorised users from access', async () => {
		const res = await request(app).post('/api/v1/users/1/favourites');
		expect(res.status).toBe(401);
	});

	it('Should prevent users from adding favs to others', async () => {
		const res = await request(app)
			.post('/api/v1/users/2/favourites')
			.set({ Authorization: `Basic ${btoa('TestUser:userPass')}` })
			.send({ dogId: 2 });
		expect(res.status).toBe(403);
	});

	it('Should allow users to add their own favourites', async () => {
		const res = await request(app)
			.post('/api/v1/users/1/favourites')
			.set({ Authorization: `Basic ${btoa('TestUser:userPass')}` })
			.send({ dogId: 2 });
		expect(res.status).toBe(201);
	});

	it('Should check if the user exists', async () => {
		const res = await request(app)
			.post('/api/v1/users/100/favourites')
			.set({ Authorization: `Basic ${btoa('TestUser:userPass')}` })
			.send({ dogId: 2 });
		expect(res.status).toBe(404);
	});

	it('Should check if the dog exists', async () => {
		const res = await request(app)
			.post('/api/v1/users/1/favourites')
			.set({ Authorization: `Basic ${btoa('TestUser:userPass')}` })
			.send({ dogId: 100 });
		expect(res.status).toBe(400);
	});

	it('Should check if the dog is already a favourite', async () => {
		const res = await request(app)
			.post('/api/v1/users/1/favourites')
			.set({ Authorization: `Basic ${btoa('TestUser:userPass')}` })
			.send({ dogId: 1 });
		expect(res.status).toBe(400);
	});
});

describe('PUT /users/{id}', () => {
	it('Should prevent unauthorised users from access', async () => {
		const res = await request(app).put('/api/v1/users/1');
		expect(res.status).toBe(401);
	});

	it('Should allow users to only update their own profile', async () => {
		const res = await request(app)
			.put('/api/v1/users/2')
			.set({ Authorization: `Basic ${btoa('TestUser:userPass')}` })
			.send({ firstName: 'Test2' });
		expect(res.status).toBe(403);
	});

	it('Should allow users to update their own record', async () => {
		const res = await request(app)
			.put('/api/v1/users/1')
			.set({ Authorization: `Basic ${btoa('TestUser:userPass')}` })
			.send({ firstName: 'Test2' });
		expect(res.status).toBe(200);
		const res2 = await request(app)
			.get('/api/v1/users/1')
			.set({ Authorization: `Basic ${btoa('TestUser:userPass')}` });
		expect(res2.body).toMatchObject({ firstName: 'Test2' });
	});

	it('Should allow users to only update themselves', async () => {
		const res = await request(app)
			.put('/api/v1/users/2')
			.set({ Authorization: `Basic ${btoa('TestUser:userPass')}` })
			.send({ firstName: 'Test2' });
		expect(res.status).toBe(403);
	});

	it('Should validate the data passed', async () => {
		const res = await request(app)
			.put('/api/v1/users/1')
			.set({ Authorization: `Basic ${btoa('TestUser:userPass')}` })
			.send({ invalid: 'value' });
		expect(res.status).toBe(400);
	});

	it('Should check that the user exists', async () => {
		const res = await request(app)
			.put('/api/v1/users/100')
			.set({ Authorization: `Basic ${btoa('TestUser:userPass')}` })
			.send({ firstName: 'Test2' });
		expect(res.status).toBe(404);
	});
});

describe('DEL /users/{id}', () => {
	it('Should prevent unauthorised users from access', async () => {
		const res = await request(app).del('/api/v1/users/1');
		expect(res.status).toBe(401);
	});

	it('Should prevent users from deleting other accounts', async () => {
		const res = await request(app)
			.del('/api/v1/users/2')
			.set({ Authorization: `Basic ${btoa('TestUser:userPass')}` });
		expect(res.status).toBe(403);
	});

	it('Should delete the account properly', async () => {
		// Create account
		const res = await request(app).post('/api/v1/users').send({
			username: 'UserToDelete',
			email: 'usertodelete@email.com',
			password: 'UnitTestPassword',
			firstName: 'Test',
			lastName: 'User'
		});
		expect(res.status).toBe(201);
		const { id } = res.body;
		// Delete account
		const res2 = await request(app)
			.del(`/api/v1/users/${id}`)
			.set({ Authorization: `Basic ${btoa('UserToDelete:UnitTestPassword')}` });
		expect(res2.status).toBe(200);
		// Check account is gone
		const res3 = await request(app)
			.get(`/api/v1/users/${id}`)
			.set({ Authorization: `Basic ${btoa('TestStaff:staffPass')}` });
		expect(res3.status).toBe(404);
	});

	it('Should check if the user exists', async () => {
		const res = await request(app)
			.del('/api/v1/users/100')
			.set({ Authorization: `Basic ${btoa('TestStaff:staffPass')}` });
		expect(res.status).toBe(404);
	});
});

describe('DEL /users/{id}/favourites/{favId}', () => {
	it('Should prevent unauthorised users from deleting', async () => {
		const res = await request(app).del('/api/v1/users/1/favourites/1');
		expect(res.status).toBe(401);
	});

	it('Should prevent users from deleting other users favs', async () => {
		const res = await request(app)
			.del('/api/v1/users/2/favourites/2')
			.set({ Authorization: `Basic ${btoa('TestUser:userPass')}` });
		expect(res.status).toBe(403);
	});

	it('Should delete the account properly', async () => {
		// Create favourite
		const res = await request(app)
			.post('/api/v1/users/1/favourites')
			.set({ Authorization: `Basic ${btoa('TestUser:userPass')}` })
			.send({ dogId: 3 });
		expect(res.status).toBe(201);
		// Delete favourite
		const { id } = res.body;
		const res2 = await request(app)
			.del(`/api/v1/users/1/favourites/${id}`)
			.set({ Authorization: `Basic ${btoa('TestUser:userPass')}` });
		expect(res2.status).toBe(200);
		// Check favourite is gone
		const res3 = await request(app)
			.get(`/api/v1/users/1/favourites/${id}`)
			.set({ Authorization: `Basic ${btoa('TestUser:userPass')}` });
		expect(res3.status).toBe(404);
	});

	it('Should check if the favourite exists', async () => {
		const res = await request(app)
			.del('/api/v1/users/1/favourites/100')
			.set({ Authorization: `Basic ${btoa('TestUser:userPass')}` });
		expect(res.status).toBe(404);
	});

	it('Should check if the user exists', async () => {
		const res = await request(app)
			.del('/api/v1/users/100/favourites/1')
			.set({ Authorization: `Basic ${btoa('TestStaff:staffPass')}` });
		expect(res.status).toBe(404);
	});
});
