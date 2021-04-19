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

describe('GET /locations', () => {
	it('should give a list of locations', async () => {
		const res = await request(app).get('/api/v1/locations');
		expect(res.status).toBe(200);
		expect(res.body).toBeInstanceOf(Array);
	});

	it('should choose sorting direction accordingly', async () => {
		const res = await request(app).get('/api/v1/locations').query({ direction: 'desc' });
		expect(res.status).toBe(200);
		expect(res.body).toBeInstanceOf(Array);
		expect(res.body[0].id).toBeGreaterThan(res.body[1].id);
	});

	it('should filter data properly', async () => {
		const res = await request(app).get('/api/v1/locations').query({ select: 'name' });
		expect(res.status).toBe(200);
		expect(res.body).toBeInstanceOf(Array);
		res.body.map(dog => expect(Object.keys(dog)).toContain('name'));
		res.body.map(dog => expect(Object.keys(dog)).not.toContain('address'));
	});

	it('should handle invalid filters', async () => {
		const res = await request(app).get('/api/v1/locations').query({ select: 'invalid' });
		expect(res.status).toBe(200);
		expect(res.body).toBeInstanceOf(Array);
		res.body.map(dog => expect(Object.keys(dog)).not.toContain('invalid'));
	});
});

describe('GET /locations/{id}', () => {
	it('should return an object', async () => {
		const res = await request(app).get('/api/v1/locations/1');
		expect(res.status).toBe(200);
		expect(res.body).toBeInstanceOf(Object);
	});

	it('should handle no filters properly', async () => {
		const res = await request(app).get('/api/v1/locations/1');
		expect(res.status).toBe(200);
		expect(res.body).toMatchObject({ name: 'Coventry shelter' });
	});

	it('should handle valid filters', async () => {
		const res = await request(app).get('/api/v1/locations/1').query({ select: 'name' });
		expect(res.status).toBe(200);
		expect(res.body).toMatchObject({ name: 'Coventry shelter' });
		expect(Object.keys(res.body)).toContain('links');
		expect(Object.keys(res.body)).not.toContain('description');
	});

	it('should handle invalid filters properly', async () => {
		const res = await request(app).get('/api/v1/locations/1').query({ select: 'invalid' });
		expect(res.status).toBe(200);
		expect(Object.keys(res.body)).toContain('links');
		expect(Object.keys(res.body)).not.toContain('invalid');
	});

	it('should handle invalid locations', async () => {
		const res = await request(app).get('/api/v1/locations/100');
		expect(res.status).toBe(404);
	});
});

describe('GET /locations/{id}/dogs', () => {
	it('should return a list of dogs', async () => {
		const res = await request(app).get('/api/v1/locations/1/dogs');
		expect(res.status).toBe(200);
		expect(res.body).toBeInstanceOf(Array);
	});

	it('should check if the location exists', async () => {
		const res = await request(app).get('/api/v1/locations/100/dogs');
		expect(res.status).toBe(404);
	});
});

describe('GET /locations/{id}/chats', () => {
	it('should prevent unauthorised access', async () => {
		const res = await request(app).get('/api/v1/locations/1/chats');
		expect(res.status).toBe(401);
	});

	it('should prevent user access', async () => {
		const res = await request(app)
			.get('/api/v1/locations/1/chats')
			.set({ Authorization: `Basic ${btoa('TestUser:userPass')}` });
		expect(res.status).toBe(403);
	});

	it('should allow staff access, at their location', async () => {
		const res = await request(app)
			.get('/api/v1/locations/1/chats')
			.set({ Authorization: `Basic ${btoa('TestStaff:staffPass')}` });
		expect(res.status).toBe(200);
		expect(res.body).toBeInstanceOf(Array);
	});

	it('should prevent staff from accessing chat at other locations', async () => {
		const res = await request(app)
			.get('/api/v1/locations/2/chats')
			.set({ Authorization: `Basic ${btoa('TestStaff:staffPass')}` });
		expect(res.status).toBe(403);
	});

	it('should check if the location exists', async () => {
		const res = await request(app)
			.get('/api/v1/locations/100/chats')
			.set({ Authorization: `Basic ${btoa('TestStaff:staffPass')}` });
		expect(res.status).toBe(404);
	});
});

describe('GET /locations/{id}/chats/{chatId}', () => {
	it('should prevent unauthorised access', async () => {
		const res = await request(app).get('/api/v1/locations/1/chats/1');
		expect(res.status).toBe(401);
	});

	it('should allow access to users associated with chat', async () => {
		const res = await request(app)
			.get('/api/v1/locations/1/chats/1')
			.set({ Authorization: `Basic ${btoa('TestUser:userPass')}` });
		expect(res.status).toBe(200);
		expect(res.body).toMatchObject({ locationId: 1, userId: 1 });
	});

	it('should prevent access to users unassociated with chat', async () => {
		const res = await request(app)
			.get('/api/v1/locations/2/chats/2')
			.set({ Authorization: `Basic ${btoa('TestUser:userPass')}` });
		expect(res.status).toBe(403);
	});

	it('should allow staff to access chats at their location', async () => {
		const res = await request(app)
			.get('/api/v1/locations/1/chats/1')
			.set({ Authorization: `Basic ${btoa('TestStaff:staffPass')}` });
		expect(res.status).toBe(200);
		expect(res.body).toMatchObject({ locationId: 1, userId: 1 });
	});

	it('should prevent access to staff not at the location', async () => {
		const res = await request(app)
			.get('/api/v1/locations/2/chats/2')
			.set({ Authorization: `Basic ${btoa('TestStaff:staffPass')}` });
		expect(res.status).toBe(403);
	});

	it('should check if the location exists', async () => {
		const res = await request(app)
			.get('/api/v1/locations/100/chats/1')
			.set({ Authorization: `Basic ${btoa('TestStaff:staffPass')}` });
		expect(res.status).toBe(404);
	});

	it('should check if the chat exists', async () => {
		const res = await request(app)
			.get('/api/v1/locations/1/chats/100')
			.set({ Authorization: `Basic ${btoa('TestStaff:staffPass')}` });
		expect(res.status).toBe(404);
	});
});

describe('GET /locations/{id}/chats/{chatId}/messages', () => {
	it('should prevent unauthorised access', async () => {
		const res = await request(app).get('/api/v1/locations/1/chats/1/messages');
		expect(res.status).toBe(401);
	});

	it('should allow access to users associated with chat', async () => {
		const res = await request(app)
			.get('/api/v1/locations/1/chats/1/messages')
			.set({ Authorization: `Basic ${btoa('TestUser:userPass')}` });
		expect(res.status).toBe(200);
		expect(res.body).toBeInstanceOf(Array);
	});

	it('should prevent access to users unassociated with chat', async () => {
		const res = await request(app)
			.get('/api/v1/locations/2/chats/2/messages')
			.set({ Authorization: `Basic ${btoa('TestUser:userPass')}` });
		expect(res.status).toBe(403);
	});

	it('should allow staff to access chats at their location', async () => {
		const res = await request(app)
			.get('/api/v1/locations/1/chats/1/messages')
			.set({ Authorization: `Basic ${btoa('TestStaff:staffPass')}` });
		expect(res.status).toBe(200);
		expect(res.body).toBeInstanceOf(Array);
	});

	it('should prevent access to staff not at the location', async () => {
		const res = await request(app)
			.get('/api/v1/locations/2/chats/2/messages')
			.set({ Authorization: `Basic ${btoa('TestStaff:staffPass')}` });
		expect(res.status).toBe(403);
	});

	it('should check if the location exists', async () => {
		const res = await request(app)
			.get('/api/v1/locations/100/chats/1/messages')
			.set({ Authorization: `Basic ${btoa('TestStaff:staffPass')}` });
		expect(res.status).toBe(404);
	});

	it('should check if the chat exists', async () => {
		const res = await request(app)
			.get('/api/v1/locations/1/chats/100/messages')
			.set({ Authorization: `Basic ${btoa('TestStaff:staffPass')}` });
		expect(res.status).toBe(404);
	});
});

describe('GET /locations/{id}/chats/{chatId}/messages/{messageId}', () => {
	it('should prevent unauthorised access', async () => {
		const res = await request(app).get('/api/v1/locations/1/chats/1/messages/1');
		expect(res.status).toBe(401);
	});

	it('should allow access to users associated with chat', async () => {
		const res = await request(app)
			.get('/api/v1/locations/1/chats/1/messages/1')
			.set({ Authorization: `Basic ${btoa('TestUser:userPass')}` });
		expect(res.status).toBe(200);
		expect(res.body).toMatchObject({ message: 'Test message' });
	});

	it('should prevent access to users unassociated with chat', async () => {
		const res = await request(app)
			.get('/api/v1/locations/2/chats/2/messages/1')
			.set({ Authorization: `Basic ${btoa('TestUser:userPass')}` });
		expect(res.status).toBe(403);
	});

	it('should allow staff to access chats at their location', async () => {
		const res = await request(app)
			.get('/api/v1/locations/1/chats/1/messages/1')
			.set({ Authorization: `Basic ${btoa('TestStaff:staffPass')}` });
		expect(res.status).toBe(200);
		expect(res.body).toMatchObject({ message: 'Test message' });
	});

	it('should prevent access to staff not at the location', async () => {
		const res = await request(app)
			.get('/api/v1/locations/2/chats/2/messages/1')
			.set({ Authorization: `Basic ${btoa('TestStaff:staffPass')}` });
		expect(res.status).toBe(403);
	});

	it('should check if the location exists', async () => {
		const res = await request(app)
			.get('/api/v1/locations/100/chats/1/messages/1')
			.set({ Authorization: `Basic ${btoa('TestStaff:staffPass')}` });
		expect(res.status).toBe(404);
	});

	it('should check if the chat exists', async () => {
		const res = await request(app)
			.get('/api/v1/locations/1/chats/100/messages/1')
			.set({ Authorization: `Basic ${btoa('TestStaff:staffPass')}` });
		expect(res.status).toBe(404);
	});

	it('should check if the message exists', async () => {
		const res = await request(app)
			.get('/api/v1/locations/1/chats/1/messages/100')
			.set({ Authorization: `Basic ${btoa('TestStaff:staffPass')}` });
		expect(res.status).toBe(404);
	});
});

describe('POST /locations', () => {
	it('should prevent unauthorised access', async () => {
		const res = await request(app).post('/api/v1/locations');
		expect(res.status).toBe(401);
	});

	it('should not allow staff to make locations', async () => {
		const res = await request(app)
			.post('/api/v1/locations')
			.set({ Authorization: `Basic ${btoa('TestStaff:staffPass')}` })
			.send({ name: 'London shelter' });
		expect(res.status).toBe(403);
	});

	it('should allow admins to create locations', async () => {
		const res = await request(app)
			.post('/api/v1/locations')
			.set({ Authorization: `Basic ${btoa('TestAdmin:adminPass')}` })
			.send({ name: 'London shelter' });
		expect(res.status).toBe(201);
	});

	it('should not allow extra fields', async () => {
		const res = await request(app)
			.post('/api/v1/locations')
			.set({ Authorization: `Basic ${btoa('TestAdmin:adminPass')}` })
			.send({ name: 'London shelter', invalid: 'value' });
		expect(res.status).toBe(400);
	});

	it('should handle invalid values', async () => {
		const res = await request(app)
			.post('/api/v1/locations')
			.set({ Authorization: `Basic ${btoa('TestAdmin:adminPass')}` })
			.send({ name: 5 });
		expect(res.status).toBe(400);
	});
});

describe('POST /locations/{id}/chats', () => {
	it('should prevent unauthorised access', async () => {
		const res = await request(app).post('/api/v1/locations/1/chats');
		expect(res.status).toBe(401);
	});

	it('should allow users to create chats', async () => {
		const res = await request(app)
			.post('/api/v1/locations/2/chats')
			.set({ Authorization: `Basic ${btoa('TestUser:userPass')}` });
		expect(res.status).toBe(201);
	});

	it('should check if the chat already exists', async () => {
		const res = await request(app)
			.post('/api/v1/locations/1/chats')
			.set({ Authorization: `Basic ${btoa('TestUser:userPass')}` });
		expect(res.status).toBe(400);
	});

	it('should not allow staff to create chats', async () => {
		const res = await request(app)
			.post('/api/v1/locations/3/chats')
			.set({ Authorization: `Basic ${btoa('TestStaff:staffPass')}` });
		expect(res.status).toBe(403);
	});

	it('should check if the location exists', async () => {
		const res = await request(app)
			.post('/api/v1/locations/100/chats')
			.set({ Authorization: `Basic ${btoa('TestUser:userPass')}` });
		expect(res.status).toBe(404);
	});
});

describe('POST /locations/{id}/chat/{chatId}/messages', () => {
	it('should prevent unauthorised access', async () => {
		const res = await request(app).post('/api/v1/locations/1/chats/1/messages');
		expect(res.status).toBe(401);
	});

	it('should allow users associated with a chat to send messages', async () => {
		const res = await request(app)
			.post('/api/v1/locations/1/chats/1/messages')
			.set({ Authorization: `Basic ${btoa('TestUser:userPass')}` })
			.send({ message: 'Hello world' });
		expect(res.status).toBe(201);
	});

	it('should give user messages a sender value of 1', async () => {
		const res = await request(app)
			.post('/api/v1/locations/1/chats/1/messages')
			.set({ Authorization: `Basic ${btoa('TestUser:userPass')}` })
			.send({ message: 'Hello world' });
		expect(res.status).toBe(201);
		const { id } = res.body;
		const res2 = await request(app)
			.get(`/api/v1/locations/1/chats/1/messages/${id}`)
			.set({ Authorization: `Basic ${btoa('TestUser:userPass')}` });
		expect(res2.status).toBe(200);
		expect(res2.body).toMatchObject({ sender: 1, message: 'Hello world' });
	});

	it('should allow staff associated with a location to send a message', async () => {
		const res = await request(app)
			.post('/api/v1/locations/1/chats/1/messages')
			.set({ Authorization: `Basic ${btoa('TestStaff:staffPass')}` })
			.send({ message: 'Hello there' });
		expect(res.status).toBe(201);
	});

	it('should give staff messages a sender value of 0', async () => {
		const res = await request(app)
			.post('/api/v1/locations/1/chats/1/messages')
			.set({ Authorization: `Basic ${btoa('TestStaff:staffPass')}` })
			.send({ message: 'Hello there' });
		expect(res.status).toBe(201);
		const { id } = res.body;
		const res2 = await request(app)
			.get(`/api/v1/locations/1/chats/1/messages/${id}`)
			.set({ Authorization: `Basic ${btoa('TestUser:userPass')}` });
		expect(res2.status).toBe(200);
		expect(res2.body).toMatchObject({ sender: 0, message: 'Hello there' });
	});

	it('should not allow users not associated with a chat to send messages', async () => {
		const res = await request(app)
			.post('/api/v1/locations/2/chats/2/messages')
			.set({ Authorization: `Basic ${btoa('TestUser:userPass')}` })
			.send({ message: 'Hello world' });
		expect(res.status).toBe(403);
	});

	it('should not allow staff to send messages to other locations', async () => {
		const res = await request(app)
			.post('/api/v1/locations/2/chats/2/messages')
			.set({ Authorization: `Basic ${btoa('TestStaff:staffPass')}` })
			.send({ message: 'Hello world' });
		expect(res.status).toBe(403);
	});

	it('should check if the location exists', async () => {
		const res = await request(app)
			.post('/api/v1/locations/100/chats/1/messages')
			.set({ Authorization: `Basic ${btoa('TestStaff:staffPass')}` })
			.send({ message: 'Hello world' });
		expect(res.status).toBe(404);
	});

	it('should check if the chat exists', async () => {
		const res = await request(app)
			.post('/api/v1/locations/1/chats/100/messages')
			.set({ Authorization: `Basic ${btoa('TestStaff:staffPass')}` })
			.send({ message: 'Hello world' });
		expect(res.status).toBe(404);
	});
});

describe('PUT /locations/{id}', () => {
	it('should not allow unauthenticated access', async () => {
		const res = await request(app).put('/api/v1/locations/1');
		expect(res.status).toBe(401);
	});

	it('should not allow users to update locations', async () => {
		const res = await request(app)
			.put('/api/v1/locations/1')
			.set({ Authorization: `Basic ${btoa('TestUser:userPass')}` })
			.send({ name: 'Updated shelter' });
		expect(res.status).toBe(403);
	});

	it('should allow staff to update their location', async () => {
		const res = await request(app)
			.put('/api/v1/locations/1')
			.set({ Authorization: `Basic ${btoa('TestStaff:staffPass')}` })
			.send({ name: 'Updated shelter' });
		expect(res.status).toBe(200);
	});

	it('should not allow staff to modify other locations', async () => {
		const res = await request(app)
			.put('/api/v1/locations/2')
			.set({ Authorization: `Basic ${btoa('TestStaff:staffPass')}` })
			.send({ name: 'Updated shelter' });
		expect(res.status).toBe(403);
	});

	it('should validate form data', async () => {
		const res = await request(app)
			.put('/api/v1/locations/1')
			.set({ Authorization: `Basic ${btoa('TestStaff:staffPass')}` })
			.send({ name: true });
		expect(res.status).toBe(400);
	});

	it('should not allow extra fields', async () => {
		const res = await request(app)
			.put('/api/v1/locations/1')
			.set({ Authorization: `Basic ${btoa('TestStaff:staffPass')}` })
			.send({ invalid: 'value' });
		expect(res.status).toBe(400);
	});

	it('should check if the location exists', async () => {
		const res = await request(app)
			.put('/api/v1/locations/100')
			.set({ Authorization: `Basic ${btoa('TestStaff:staffPass')}` })
			.send({ name: 'Updated shelter' });
		expect(res.status).toBe(404);
	});
});

describe('DEL /locations/{id}', () => {
	it('should prevent unauthorised access', async () => {
		const res = await request(app).del('/api/v1/locations/1');
		expect(res.status).toBe(401);
	});

	it('should not allow users to delete locations', async () => {
		const res = await request(app)
			.del('/api/v1/locations/1')
			.set({ Authorization: `Basic ${btoa('TestUser:userPass')}` });
		expect(res.status).toBe(403);
	});

	it('should not allow staff to delete locations', async () => {
		const res = await request(app)
			.del('/api/v1/locations/1')
			.set({ Authorization: `Basic ${btoa('TestStaff:staffPass')}` });
		expect(res.status).toBe(403);
	});

	it('should allow admins to delete locations', async () => {
		const res = await request(app)
			.del('/api/v1/locations/1')
			.set({ Authorization: `Basic ${btoa('TestAdmin:adminPass')}` });
		expect(res.status).toBe(200);
	});

	it('should check if the location exists', async () => {
		const res = await request(app)
			.del('/api/v1/locations/100')
			.set({ Authorization: `Basic ${btoa('TestAdmin:adminPass')}` });
		expect(res.status).toBe(404);
	});
});

describe('DEL /locations/{id}/chats/{chatId}', () => {
	it('should prevent unauthorised access', async () => {
		const res = await request(app).del('/api/v1/locations/1/chats/1');
		expect(res.status).toBe(401);
	});

	it('should allow users to delete chats associated with them', async () => {
		const res = await request(app)
			.del('/api/v1/locations/2/chats/6')
			.set({ Authorization: `Basic ${btoa('TestUser3:userPass3')}` });
		expect(res.status).toBe(200);
	});

	it('should allow staff to delete chats associated with them', async () => {
		const res = await request(app)
			.del('/api/v1/locations/2/chats/2')
			.set({ Authorization: `Basic ${btoa('TestStaff2:staffPass2')}` });
		expect(res.status).toBe(200);
	});

	it('should prevent users from deleting chats not associated with them', async () => {
		const res = await request(app)
			.del('/api/v1/locations/2/chats/7')
			.set({ Authorization: `Basic ${btoa('TestUser:userPass')}` });
		expect(res.status).toBe(403);
	});

	it('should prevent staff from deleting chats not at their location', async () => {
		const res = await request(app)
			.del('/api/v1/locations/2/chats/7')
			.set({ Authorization: `Basic ${btoa('TestStaff:staffPass')}` });
		expect(res.status).toBe(403);
	});

	it('should check that the location exists', async () => {
		const res = await request(app)
			.del('/api/v1/locations/100/chats/7')
			.set({ Authorization: `Basic ${btoa('TestStaff:staffPass')}` });
		expect(res.status).toBe(404);
	});

	it('should check that the chat exists', async () => {
		const res = await request(app)
			.del('/api/v1/locations/2/chats/100')
			.set({ Authorization: `Basic ${btoa('TestStaff:staffPass')}` });
		expect(res.status).toBe(404);
	});
});

// TODO: uncomment this and carry on with it
describe('DEL /locations/{id}/chats/{chatId}/messages/{messageId}', () => {
	it('should prevent unauthorised access', async () => {
		const res = await request(app).del('/api/v1/locations/2/chats/6/messages/5');
		expect(res.status).toBe(401);
	});

	it('should allow users to delete their own message', async () => {
		const res = await request(app)
			.del('/api/v1/locations/2/chats/7/messages/5')
			.set({ Authorization: `Basic ${btoa('TestUser2:userPass2')}` });
		expect(res.status).toBe(200);
	});

	it('should prevent users from deleting staff messages', async () => {
		const res = await request(app)
			.del('/api/v1/locations/2/chats/7/messages/8')
			.set({ Authorization: `Basic ${btoa('TestUser2:userPass2')}` });
		expect(res.status).toBe(403);
	});

	it('should allow staff to delete their own messages', async () => {
		const res = await request(app)
			.del('/api/v1/locations/2/chats/7/messages/7')
			.set({ Authorization: `Basic ${btoa('TestStaff2:staffPass2')}` });
		expect(res.status).toBe(200);
	});

	it('should prevent staff from deleting user messages', async () => {
		const res = await request(app)
			.del('/api/v1/locations/2/chats/7/messages/6')
			.set({ Authorization: `Basic ${btoa('TestStaff2:staffPass2')}` });
		expect(res.status).toBe(403);
	});

	it('should check if the location exists', async () => {
		const res = await request(app)
			.del('/api/v1/locations/100/chats/7/messages/6')
			.set({ Authorization: `Basic ${btoa('TestStaff2:staffPass2')}` });
		expect(res.status).toBe(404);
	});

	it('should check if the chat exists', async () => {
		const res = await request(app)
			.del('/api/v1/locations/2/chats/100/messages/6')
			.set({ Authorization: `Basic ${btoa('TestStaff2:staffPass2')}` });
		expect(res.status).toBe(404);
	});

	it('should check if the message exists', async () => {
		const res = await request(app)
			.del('/api/v1/locations/2/chats/7/messages/100')
			.set({ Authorization: `Basic ${btoa('TestStaff2:staffPass2')}` });
		expect(res.status).toBe(404);
	});
});
