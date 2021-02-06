const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');

const router = new Router({ prefix: '/api/v1/dogs' });

let dogs = [
    {
        name: 'Doggo',
        description: 'A good boi.',
        views: 0,
        age: 4,
        gender: 'male',
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Samojed00.jpg/1024px-Samojed00.jpg',
        dateCreated: '23/12/2019',
        dateModified: '23/12/2019'
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
const isValid = id => id < dogs.length + 1 && id > 0;

router.get('/', getAll);
router.post('/', bodyParser(), addDog);

router.get('/:id([0-9]{1,})', getDog);
router.put('/:id([0-9]{1,})', updateDog);
router.del('/:id([0-9]{1,})', deleteDog);

/**
 * Gets all the dogs from the database.
 */
async function getAll(ctx) {
    ctx.body = dogs;
}

/**
 * Gets a single dog from the database.
 */
async function getDog(ctx) {
    const id = parseInt(ctx.params.id);
    if (isValid(id)) {
        dogs[id - 1].views++;
        ctx.body = dogs[id - 1];
    } else
        ctx.status = 404;
}

/**
 * Adds a dog to the database.
 */
async function addDog(ctx) {
    const { name, description, age, gender, imageUrl } = ctx.request.body;
    const date = await getCurrentDate();
    // Creating a new dog
    let newDog = {
        name, description, age, gender, imageUrl,
        dateCreated: date, dateModified: date
    };
    dogs.push(newDog);
    ctx.status = 201;
    ctx.body = newDog;
}

/**
 * Updates a dog in the database.
 */
async function updateDog(ctx) {
    const id = parseInt(ctx.params.id);
    if (isValid(id)) {
        const dog = dogs[id - 1];
        // Constructing updated dog
        const { name, description, age, gender, imageUrl } = ctx.request.body;
        const { dateCreated } = dog;
        const dateModified = await getCurrentDate();
        const updatedDog = { name, description, age, gender, imageUrl, dateCreated, dateModified };

        ctx.body = updatedDog;
    } else {
        ctx.status = 404;
    }
}

/**
 * Deletes a dog from the database.
 */
async function deleteDog(ctx) {
    const id = parseInt(ctx.params.id);
    if (isValid(id)) {
        dogs.splice(id - 1, 1);
        ctx.status = 200;
    } else {
        ctx.status = 404;
    }
}

module.exports = router;