# Canine Shelter API documentation

Welcome to the Canine Shelter API documentation homepage.

## Setup

### Database
To start off, two databases (schemas) need to be created in MySQL, called `canine_shelter` and `canine_test_db`.
The databases should have no tables.

Then, `npm run db:refresh` to populate the database with tables and sample data.

### Config files
Create a copy of `config.js.template` and rename it to `config.js`, and fill in the values in the files to appropriate fields.

Then, rename `.env.template` to `.env`.

### Directories

For file uploads, two directories need to be created: `/tmp/api/uploads` and `/var/tmp/api/public/images`.

## Usage

### Starting the API

To start the API, use the `npm start` command.

## Testing

Testing the code can be done through the `npm run test` command, and coverage is generated using `npm run test:coverage`.

## Documentation

The documentation can be generating using the `npm run docs` command.

OpenAPI documentation can be accessed via `openapi/index.html`.