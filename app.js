'use strict';

const Koa = require('koa');
const cors = require('@koa/cors');

const app = new Koa();

const special = require('./routes/special');
const users = require('./routes/users');
const dogs = require('./routes/dogs');
const breeds = require('./routes/breeds');
const locations = require('./routes/locations');
const auth = require('./routes/auth');
const staff = require('./routes/staff');

app.use(cors());

app.use(special.routes());
app.use(users.routes());
app.use(dogs.routes());
app.use(breeds.routes());
app.use(locations.routes());
app.use(auth.routes());
app.use(staff.routes());

module.exports = app;
