'use strict';

const { db } = require('../helpers/database');

module.exports = async () => {
	await db.migrate.rollback();
	await db.migrate.latest();
	await db.seed.run();
};
