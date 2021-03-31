'use strict';

/**
 * @file Special route endpoints.
 * @module routes/special
 * @author Bartlomiej Wlodarski
 */

const Router = require('koa-router');

const router = new Router({ prefix: '/api/v1' });

router.get('/', welcome);

router.get('//', easterEgg);

const welcome = async ctx => {
	const data = { message: 'The Canine Shelter API' };
	ctx.body = data;
};

const easterEgg = async ctx => {
	const data = { message: "I'm a teapot!" };
	ctx.status = 418;
	ctx.body = data;
};

module.exports = router;
