# Controllers

This directory contains the controllers used in the API. Said controllers are used for controlling access to the API endpoints.

## Authentication - [`auth.js`](./auth.js)

The [`auth.js`](./auth.js) file is used for authenticating users when accessing secure end-points in the API. For example, it is used for the `GET /api/v1/users` endpoint so that only users that are logged in may see this (however, they still need the right role).

```js
// routes/users.js
const Router = require('koa-router');
const { auth } = require('../controllers/auth');

const router = new Router({ prefix: '/api/v1/users' });

router.get('/', auth, getAll);
```

## Validation - [`validation.js`](./validation.js)

The [`validation.js`](./validation.js) file is used for validating the contents of incoming POST requests. the `makeValidator` function generates Koa middleware that are used with [schemas](../schemas) to make sure the contents of POST requests are accepted by the database and fall within RegEx patterns or length limits.

```js
const Router = require('koa-router');

...

const {
	validateDog,
	validateDogBreed,
	validateDogLocation
} = require('../controllers/validation');

const { auth } = require('../controllers/auth');
const router = new Router({ prefix: '/api/v1/dogs' });

...

router.post('/', auth, bodyParser(), validateDog, addDog);
```
