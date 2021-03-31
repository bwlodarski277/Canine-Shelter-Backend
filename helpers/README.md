# Helpers

This directory contains the helpers used in the API. They are used for simplifying interactions by the use of re-usable functions.

## Database - [`database.js`](./database.js)

The [`database.js`](./database.js) module is used for easier interactions with the database through the `run` function, by functioning as an error wrapper for Knex. The error wrapper makes sure no sensitive information is leaked to users through error messages.

```js
// Importing the run function and db class
const { db, run } = require('./helpers/database');
// Using db class to get all dogs
const users = await run(async () => await db('dogs'));
```

## JSON Web Token - [`jwt.js`](./jwt.js)

The [`jwt.js`](./jwt.js) module is used for verifying and generating JWT and refresh tokens for use in the [`auth.js`](../routes/auth.js) route file.

## Twitter - [`twitter.js`](./twitter.js)

The [`twitter.js`](./twitter.js) module is used for sending tweets when a new dog is added to the system.
