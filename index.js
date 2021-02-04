const Koa = require('koa');
const Router = require('koa-router');

const app = new Koa();

const router = new Router();

router.get('/', welcome);

async function welcome(ctx) {
    const data = { message: 'The Canine Shelter API' };
    ctx.body = data;
}

app.use(router.routes());

const port = process.env.PORT || 3000;

app.listen(port, () => console.log(`listening on port ${port}`));