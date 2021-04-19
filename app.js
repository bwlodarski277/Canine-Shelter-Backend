'use strict';

const Koa = require('koa');
const cors = require('@koa/cors');
// const { DatabaseException } = require('./helpers/database');

const app = new Koa();

const special = require('./routes/special');
const users = require('./routes/users');
const dogs = require('./routes/dogs');
const breeds = require('./routes/breeds');
const locations = require('./routes/locations');
const auth = require('./routes/auth');
const staff = require('./routes/staff');

// Allowing the frontend box to access the API.
// const options = { origin: 'https://latin-kimono-3000.codio-box.uk' };

app.use(cors());

// app.use(async (ctx, next) => {
// 	try {
// 		await next();
// 	} catch (err) /* istanbul ignore next */ {
// 		if (err instanceof DatabaseException) ctx.status = 400;
// 		else ctx.status = 500;
// 		ctx.body = err.message;
// 	}
// });

app.use(special.routes());
app.use(users.routes());
app.use(dogs.routes());
app.use(breeds.routes());
app.use(locations.routes());
app.use(auth.routes());
app.use(staff.routes());

module.exports = app;
