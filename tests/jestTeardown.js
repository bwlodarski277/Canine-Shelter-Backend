'use strict';

const { db } = require('../helpers/database');

module.exports = async () => {
	await db.destroy();
};
