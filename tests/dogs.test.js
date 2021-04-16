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

describe('GET /dogs', () => {
	it('should not allow unauthorised dogs to view dogs list', async () => {
		const res = await request(app).get('/api/v1/dogs');
		expect(res.status).toBe(200);
		expect(res.body).toBeInstanceOf(Array);
	});

	it('should choose sorting direction accordingly', async () => {
		const res = await request(app).get('/api/v1/dogs').query({ direction: 'desc' });
		expect(res.status).toBe(200);
		expect(res.body).toBeInstanceOf(Array);
		expect(res.body[0].id).toBeGreaterThan(res.body[1].id);
	});

	it('should filter data properly', async () => {
		const res = await request(app).get('/api/v1/dogs').query({ select: 'name' });
		expect(res.status).toBe(200);
		expect(res.body).toBeInstanceOf(Array);
		res.body.map(dog => expect(Object.keys(dog)).toContain('name'));
		res.body.map(dog => expect(Object.keys(dog)).not.toContain('age'));
	});

	it('should handle invalid filters', async () => {
		const res = await request(app).get('/api/v1/dogs').query({ select: 'invalid' });
		expect(res.status).toBe(200);
		expect(res.body).toBeInstanceOf(Array);
		res.body.map(dog => expect(Object.keys(dog)).not.toContain('invalid'));
	});
});

describe('GET /dogs/{id}', () => {
	it('should return an object', async () => {
		const res = await request(app).get('/api/v1/dogs/1');
		expect(res.status).toBe(200);
		expect(res.body).toBeInstanceOf(Object);
	});

	it('should handle no filters properly', async () => {
		const res = await request(app).get('/api/v1/dogs/1');
		expect(res.status).toBe(200);
		expect(res.body).toMatchObject({ name: 'Rex' });
	});

	it('should handle valid filters', async () => {
		const res = await request(app).get('/api/v1/dogs/1').query({ select: 'age' });
		expect(res.status).toBe(200);
		expect(res.body).toMatchObject({ age: 5 });
		expect(Object.keys(res.body)).toContain('links');
		expect(Object.keys(res.body)).not.toContain('name');
	});

	it('should handle invalid filters properly', async () => {
		const res = await request(app).get('/api/v1/dogs/1').query({ select: 'invalid' });
		expect(res.status).toBe(200);
		expect(Object.keys(res.body)).toContain('links');
		expect(Object.keys(res.body)).not.toContain('invalid');
	});

	it('should handle invalid dogs', async () => {
		const res = await request(app).get('/api/v1/dogs/100');
		expect(res.status).toBe(404);
	});
});

describe('GET /dogs/{id}/breed', () => {
	it('should show the dogs breed', async () => {
		const res = await request(app).get('/api/v1/dogs/1/breed');
		expect(res.status).toBe(200);
		expect(res.body).toMatchObject({ dogId: 1, breedId: 1 });
		expect(Object.keys(res.body)).toContain('links');
	});

	it('should check if the dog exists', async () => {
		const res = await request(app).get('/api/v1/dogs/100/breed');
		expect(res.status).toBe(404);
	});
});

describe('GET /dogs/{id}/location', () => {
	it('should show the dogs location', async () => {
		const res = await request(app).get('/api/v1/dogs/1/location');
		expect(res.status).toBe(200);
		expect(res.body).toMatchObject({ dogId: 1, locationId: 1 });
		expect(Object.keys(res.body)).toContain('links');
	});

	it('should check if the dog exists', async () => {
		const res = await request(app).get('/api/v1/dogs/100/location');
		expect(res.status).toBe(404);
	});
});

describe('GET /dogs/{id}/favourites', () => {
	it('should show the number of favourites', async () => {
		const res = await request(app).get('/api/v1/dogs/1/favourites');
		expect(res.status).toBe(200);
		expect(res.body).toMatchObject({ count: 1 });
	});

	it('should check if the dog exists', async () => {
		const res = await request(app).get('/api/v1/dogs/100/favourites');
		expect(res.status).toBe(404);
	});
});

describe('POST /dogs', () => {
	it('should prevent unauthorised access', async () => {
		const res = await request(app).post('/api/v1/dogs');
		expect(res.status).toBe(401);
	});

	it('should prevent users from adding dogs', async () => {
		const res = await request(app)
			.post('/api/v1/dogs')
			.set({ Authorization: `Basic ${btoa('TestUser:userPass')}` })
			.send({ name: 'New doggo' });
		expect(res.status).toBe(403);
	});

	it('should accept valid schema', async () => {
		const res = await request(app)
			.post('/api/v1/dogs')
			.set({ Authorization: `Basic ${btoa('TestStaff:staffPass')}` })
			.send({ name: 'New doggo' });
		expect(res.status).toBe(201);
	});

	it('Should validate requests', async () => {
		const res = await request(app)
			.post('/api/v1/dogs')
			.set({ Authorization: `Basic ${btoa('TestStaff:staffPass')}` })
			.send({ name: true });
		expect(res.status).toBe(400);
	});

	it('Should not allow extra values', async () => {
		const res = await request(app)
			.post('/api/v1/dogs')
			.set({ Authorization: `Basic ${btoa('TestStaff:staffPass')}` })
			.send({ name: 'Good boi', invalid: 'value' });
		expect(res.status).toBe(400);
	});
});

describe('POST /dogs/{id}/breed', () => {
	it('should prevent unauthorised access', async () => {
		const res = await request(app).post('/api/v1/dogs/3/breed');
		expect(res.status).toBe(401);
	});

	it('should prevent users from adding breeds', async () => {
		const res = await request(app)
			.post('/api/v1/dogs/3/breed')
			.set({ Authorization: `Basic ${btoa('TestUser:userPass')}` })
			.send({ breedId: 3 });
		expect(res.status).toBe(403);
	});

	it('should allow staff to assign breeds', async () => {
		const res = await request(app)
			.post('/api/v1/dogs/3/breed')
			.set({ Authorization: `Basic ${btoa('TestStaff:staffPass')}` })
			.send({ breedId: 3 });
		expect(res.status).toBe(201);
	});

	it('should check if the dog already has a breed', async () => {
		const res = await request(app)
			.post('/api/v1/dogs/2/breed')
			.set({ Authorization: `Basic ${btoa('TestStaff:staffPass')}` })
			.send({ breedId: 3 });
		expect(res.status).toBe(400);
	});

	it('should check if the dog exists', async () => {
		const res = await request(app)
			.post('/api/v1/dogs/100/breed')
			.set({ Authorization: `Basic ${btoa('TestStaff:staffPass')}` })
			.send({ breedId: 3 });
		expect(res.status).toBe(404);
	});
});

describe('POST /dogs/{id}/location', () => {
	it('should prevent unauthorised access', async () => {
		const res = await request(app).post('/api/v1/dogs/3/location');
		expect(res.status).toBe(401);
	});

	it('should prevent users from adding location', async () => {
		const res = await request(app)
			.post('/api/v1/dogs/3/location')
			.set({ Authorization: `Basic ${btoa('TestUser:userPass')}` })
			.send({ locationId: 3 });
		expect(res.status).toBe(403);
	});

	it('should allow staff to assign location', async () => {
		const res = await request(app)
			.post('/api/v1/dogs/3/location')
			.set({ Authorization: `Basic ${btoa('TestStaff:staffPass')}` })
			.send({ locationId: 2 });
		expect(res.status).toBe(201);
	});

	it('should check if the dog already has a location', async () => {
		const res = await request(app)
			.post('/api/v1/dogs/2/location')
			.set({ Authorization: `Basic ${btoa('TestStaff:staffPass')}` })
			.send({ locationId: 2 });
		expect(res.status).toBe(400);
	});

	it('should check if the dog exists', async () => {
		const res = await request(app)
			.post('/api/v1/dogs/100/location')
			.set({ Authorization: `Basic ${btoa('TestStaff:staffPass')}` })
			.send({ locationId: 3 });
		expect(res.status).toBe(404);
	});
});

describe('PUT /dogs/{id}', () => {
	it('should prevent unauthorised access', async () => {
		const res = await request(app).put('/api/v1/dogs/1');
		expect(res.status).toBe(401);
	});

	it('should prevent users from updating dogs', async () => {
		const res = await request(app)
			.put('/api/v1/dogs/1')
			.set({ Authorization: `Basic ${btoa('TestUser:userPass')}` })
			.send({ name: 'Doggo' });
		expect(res.status).toBe(403);
	});

	it('should allow staff to update dogs at their location', async () => {
		const res = await request(app)
			.put('/api/v1/dogs/1')
			.set({ Authorization: `Basic ${btoa('TestStaff:staffPass')}` })
			.send({ name: 'Doggo' });
		expect(res.status).toBe(200);
	});

	it('should prevent staff from updating dogs at different locations', async () => {
		const res = await request(app)
			.put('/api/v1/dogs/2')
			.set({ Authorization: `Basic ${btoa('TestStaff:staffPass')}` })
			.send({ name: 'Doggo' });
		expect(res.status).toBe(403);
	});

	it('should allow staff to update dogs not assigned to a location', async () => {
		const res = await request(app)
			.put('/api/v1/dogs/4')
			.set({ Authorization: `Basic ${btoa('TestStaff:staffPass')}` })
			.send({ name: 'Doggo' });
		expect(res.status).toBe(200);
	});

	it('should check that the dog exists', async () => {
		const res = await request(app)
			.put('/api/v1/dogs/100')
			.set({ Authorization: `Basic ${btoa('TestStaff:staffPass')}` })
			.send({ name: 'Doggo' });
		expect(res.status).toBe(404);
	});
});

describe('PUT /dogs/{id}/breed', () => {
	it('should prevent unauthorised access', async () => {
		const res = await request(app).put('/api/v1/dogs/1/breed');
		expect(res.status).toBe(401);
	});

	it('should prevent users from updating dogs', async () => {
		const res = await request(app)
			.put('/api/v1/dogs/1/breed')
			.set({ Authorization: `Basic ${btoa('TestUser:userPass')}` })
			.send({ breedId: 1 });
		expect(res.status).toBe(403);
	});

	it('should allow staff to update dogs at their location', async () => {
		const res = await request(app)
			.put('/api/v1/dogs/1/breed')
			.set({ Authorization: `Basic ${btoa('TestStaff:staffPass')}` })
			.send({ breedId: 1 });
		expect(res.status).toBe(200);
	});

	it('should prevent staff from updating dogs at different locations', async () => {
		const res = await request(app)
			.put('/api/v1/dogs/2/breed')
			.set({ Authorization: `Basic ${btoa('TestStaff:staffPass')}` })
			.send({ breedId: 1 });
		expect(res.status).toBe(403);
	});

	it('should allow staff to update dogs not assigned to a location', async () => {
		const res = await request(app)
			.put('/api/v1/dogs/4/breed')
			.set({ Authorization: `Basic ${btoa('TestStaff:staffPass')}` })
			.send({ breedId: 1 });
		expect(res.status).toBe(200);
	});

	it('should check that the dog exists', async () => {
		const res = await request(app)
			.put('/api/v1/dogs/100/breed')
			.set({ Authorization: `Basic ${btoa('TestStaff:staffPass')}` })
			.send({ breedId: 1 });
		expect(res.status).toBe(404);
	});
});

describe('PUT /dogs/{id}/location', () => {
	it('should prevent unauthorised access', async () => {
		const res = await request(app).put('/api/v1/dogs/1/location');
		expect(res.status).toBe(401);
	});

	it('should prevent users from updating dogs', async () => {
		const res = await request(app)
			.put('/api/v1/dogs/1/location')
			.set({ Authorization: `Basic ${btoa('TestUser:userPass')}` })
			.send({ locationId: 1 });
		expect(res.status).toBe(403);
	});

	it('should allow staff to update dogs at their location', async () => {
		const res = await request(app)
			.put('/api/v1/dogs/1/location')
			.set({ Authorization: `Basic ${btoa('TestStaff:staffPass')}` })
			.send({ locationId: 1 });
		expect(res.status).toBe(200);
	});

	it('should prevent staff from updating dogs at different locations', async () => {
		const res = await request(app)
			.put('/api/v1/dogs/2/location')
			.set({ Authorization: `Basic ${btoa('TestStaff:staffPass')}` })
			.send({ locationId: 1 });
		expect(res.status).toBe(403);
	});

	it('should allow staff to update dogs not assigned to a location', async () => {
		const res = await request(app)
			.put('/api/v1/dogs/4/location')
			.set({ Authorization: `Basic ${btoa('TestStaff:staffPass')}` })
			.send({ locationId: 1 });
		expect(res.status).toBe(200);
	});

	it('should check that the dog exists', async () => {
		const res = await request(app)
			.put('/api/v1/dogs/100/location')
			.set({ Authorization: `Basic ${btoa('TestStaff:staffPass')}` })
			.send({ locationId: 1 });
		expect(res.status).toBe(404);
	});
});

describe('DEL /dogs/{id}', () => {
	it('should prevent unauthorised access', async () => {
		const res = await request(app).del('/api/v1/dogs/5');
		expect(res.status).toBe(401);
	});

	it('should prevent users from deleting dogs', async () => {
		const res = await request(app)
			.del('/api/v1/dogs/5')
			.set({ Authorization: `Basic ${btoa('TestUser:userPass')}` });
		expect(res.status).toBe(403);
	});

	it('should allow staff to delete dogs at their location', async () => {
		const res = await request(app)
			.del('/api/v1/dogs/5')
			.set({ Authorization: `Basic ${btoa('TestStaff:staffPass')}` });
		expect(res.status).toBe(200);
	});

	it('should prevent staff from deleting dogs at different locations', async () => {
		const res = await request(app)
			.del('/api/v1/dogs/6')
			.set({ Authorization: `Basic ${btoa('TestStaff:staffPass')}` });
		expect(res.status).toBe(403);
	});

	it('should allow staff to delete dogs not assigned to a location', async () => {
		const res = await request(app)
			.del('/api/v1/dogs/7')
			.set({ Authorization: `Basic ${btoa('TestStaff:staffPass')}` })
			.send({ name: 'Doggo' });
		expect(res.status).toBe(200);
	});

	it('should check that the dog exists', async () => {
		const res = await request(app)
			.del('/api/v1/dogs/100')
			.set({ Authorization: `Basic ${btoa('TestStaff:staffPass')}` })
			.send({ name: 'Doggo' });
		expect(res.status).toBe(404);
	});
});

describe('DEL /dogs/{id}/breed', () => {
	it('should prevent unauthorised access', async () => {
		const res = await request(app).del('/api/v1/dogs/1/breed');
		expect(res.status).toBe(401);
	});

	it('should prevent users from deleting breed', async () => {
		const res = await request(app)
			.del('/api/v1/dogs/1/breed')
			.set({ Authorization: `Basic ${btoa('TestUser:userPass')}` });
		expect(res.status).toBe(403);
	});

	it('should allow staff to delete dog breeds at their location', async () => {
		const res = await request(app)
			.del('/api/v1/dogs/9/breed')
			.set({ Authorization: `Basic ${btoa('TestStaff:staffPass')}` });
		expect(res.body).toMatchObject({ deleted: true });
		expect(res.status).toBe(200);
	});

	it('should prevent staff from deleting dogs at different locations', async () => {
		const res = await request(app)
			.del('/api/v1/dogs/6/breed')
			.set({ Authorization: `Basic ${btoa('TestStaff:staffPass')}` });
		expect(res.status).toBe(403);
	});

	it('should check that the dog exists', async () => {
		const res = await request(app)
			.del('/api/v1/dogs/100/breed')
			.set({ Authorization: `Basic ${btoa('TestStaff:staffPass')}` })
			.send({ name: 'Doggo' });
		expect(res.status).toBe(404);
	});

	it('should check the dog has a breed assigned', async () => {
		const res = await request(app)
			.del('/api/v1/dogs/1/breed')
			.set({ Authorization: `Basic ${btoa('TestStaff:staffPass')}` });
		expect(res.status).toBe(400);
	});

	it('should allow staff to delete breed if dog has no location', async () => {
		const res = await request(app)
			.del('/api/v1/dogs/4/breed')
			.set({ Authorization: `Basic ${btoa('TestStaff:staffPass')}` });
		expect(res.status).toBe(400); // This dog has no breed
	});
});

describe('DEL /dogs/{id}/location', () => {
	it('should prevent unauthorised access', async () => {
		const res = await request(app).del('/api/v1/dogs/1/location');
		expect(res.status).toBe(401);
	});

	it('should prevent users from deleting breed', async () => {
		const res = await request(app)
			.del('/api/v1/dogs/1/location')
			.set({ Authorization: `Basic ${btoa('TestUser:userPass')}` });
		expect(res.status).toBe(403);
	});

	it('should allow staff to delete locations at their location', async () => {
		const res = await request(app)
			.del('/api/v1/dogs/1/location')
			.set({ Authorization: `Basic ${btoa('TestStaff:staffPass')}` });
		expect(res.status).toBe(200);
	});

	it('should prevent staff from deleting at other locations', async () => {
		const res = await request(app)
			.del('/api/v1/dogs/2/location')
			.set({ Authorization: `Basic ${btoa('TestStaff:staffPass')}` });
		expect(res.status).toBe(403);
	});

	it('should check if a dog has a location', async () => {
		const res = await request(app)
			.del('/api/v1/dogs/1/location')
			.set({ Authorization: `Basic ${btoa('TestStaff:staffPass')}` });
		expect(res.status).toBe(400);
	});

	it('should check if the dog exists', async () => {
		const res = await request(app)
			.del('/api/v1/dogs/100/location')
			.set({ Authorization: `Basic ${btoa('TestStaff:staffPass')}` });
		expect(res.status).toBe(404);
	});
});
