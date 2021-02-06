const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');

const router = new Router({ prefix: '/api/v1/users' });

let users = [
    {
        username: 'aTuring',
        email: 'aTuring@example.com',
        firstName: 'Alan',
        lastName: 'Turing',
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/a/a1/Alan_Turing_Aged_16.jpg',
        dateCreated: '10/02/2013',
        dateModified: '10/02/2013'
    },
    {
        username: 'tBLee',
        email: 'tBLee@example.com',
        firstName: 'Tim',
        lastName: 'Berners-Lee',
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/4/4e/Sir_Tim_Berners-Lee_%28cropped%29.jpg',
        dateCreated: '15/05/2017',
        dateModified: '22/07/2018'
    },
    {
        username: 'JvNeumann',
        email: 'JvNeumann@example.com',
        firstName: 'John',
        lastName: 'Neumann',
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/5/5e/JohnvonNeumann-LosAlamos.gif',
        dateCreated: '10/02/2013',
        dateModified: '10/02/2013'
    }
]

/**
 * Creates a date string.
 */
async function getCurrentDate() {
    const now = new Date();
    const date = `${now.getDate()}/${now.getMonth()}/${now.getFullYear()}`;
    return date;
}

/**
 * Checks if an ID is valid.
 * @param {int} id ID to check
 */
const isValid = id => id < users.length + 1 && id > 0;

router.get('/', getAll);
router.post('/', bodyParser(), createUser);

router.get('/:id([0-9]{1,})', getUser);
router.put('/:id([0-9]{1,})', updateUser);
router.del('/:id([0-9]{1,})', deleteUser);

/**
 * Gets all the users from the database.
 */
async function getAll(ctx) {
    ctx.body = users;
}

/**
 * Gets a single user from the database.
 */
async function getUser(ctx) {
    const id = parseInt(ctx.params.id);
    if (isValid(id))
        ctx.body = users[id - 1];
    else
        ctx.status = 404;
}

/**
 * Adds a user to the database.
 */
async function createUser(ctx) {
    const { username, email, firstName, lastName, imageUrl } = ctx.request.body;
    const date = await getCurrentDate();
    // Creating a new user
    let newUser = {
        username, email, firstName, lastName, dateCreated: date,
        dateModified: date, imageUrl
    };
    users.push(newUser);
    ctx.status = 201;
    ctx.body = newUser;
}

/**
 * Updates a user in the database.
 */
async function updateUser(ctx) {
    const id = parseInt(ctx.params.id);
    if (isValid(id)) {
        const user = users[id - 1];
        // Constructing updated user
        const { username, email, firstName, lastName, imageUrl } = ctx.request.body;
        const { dateCreated } = user;
        const dateModified = await getCurrentDate();
        const updatedUser = { username, email, firstName, lastName, imageUrl, dateCreated, dateModified };

        ctx.body = updatedUser;
    } else {
        ctx.status = 404;
    }
}

/**
 * Deletes a user from the database.
 */
async function deleteUser(ctx) {
    const id = parseInt(ctx.params.id);
    if (isValid(id)) {
        users.splice(id - 1, 1);
        ctx.status = 200;
    } else {
        ctx.status = 404;
    }
}

module.exports = router;