'use strict';

/**
 * @file Special route endpoints.
 * @module routes/special
 * @author Bartlomiej Wlodarski
 */

const Router = require('koa-router');
const { ifNoneMatch } = require('../helpers/caching');

const prefix = '/api/v1';
const router = new Router({ prefix });

const welcome = async (ctx, next) => {
	const links = {
		breeds: `${ctx.protocol}://${ctx.host}${prefix}/breeds`,
		dogs: `${ctx.protocol}://${ctx.host}${prefix}/dogs`,
		locations: `${ctx.protocol}://${ctx.host}${prefix}/locations`,
		staff: `${ctx.protocol}://${ctx.host}${prefix}/staff`,
		users: `${ctx.protocol}://${ctx.host}${prefix}/users`
	};
	const data = { message: 'The Canine Shelter API', links };
	ctx.body = data;
	return next();
};

router.get('/', welcome, ifNoneMatch);

module.exports = router;
