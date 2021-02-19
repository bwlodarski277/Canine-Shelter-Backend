const Koa = require('koa');

const app = new Koa();

const special = require('./routes/special');
const users = require('./routes/users');
const dogs = require('./routes/dogs');
const breeds = require('./routes/breeds');
const locations = require('./routes/locations');
const login = require('./routes/login');

app.use(special.routes());
app.use(users.routes());
app.use(dogs.routes());
app.use(breeds.routes());
app.use(locations.routes());

app.use(login.routes());

const port = process.env.PORT || 3000;

app.listen(port, () => console.log(`listening on port ${port}`));