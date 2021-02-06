const Router = require('koa-router');

const router = new Router({ prefix: '/api/v1' });

router.get('/', welcome);

router.get('//', easterEgg);

async function welcome(ctx) {
    const data = { message: 'The Canine Shelter API' };
    ctx.body = data;
}

async function easterEgg(ctx) {
    const data = { message: 'I\'m a teapot!' };
    ctx.status = 418;
    ctx.body = data;
}

module.exports = router;