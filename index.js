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

// Allowing the frontend box to access the API.
const options = { origin: 'https://latin-kimono-3000.codio-box.uk' };

app.use(cors(options));

app.use(special.routes());
app.use(users.routes());
app.use(dogs.routes());
app.use(breeds.routes());
app.use(locations.routes());

app.use(auth.routes());

const port = process.env.PORT || 3000;

app.listen(port, () => console.log(`listening on port ${port}`));
