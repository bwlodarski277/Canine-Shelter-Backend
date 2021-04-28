'use strict';

const Router = require('koa-router');
const { v4: uuidV4 } = require('uuid');
const { existsSync, copyFileSync, createReadStream, mkdirSync } = require('fs');
const { auth } = require('../controllers/auth');

const uploadDir = '/tmp/api/uploads';
const fileStore = '/var/tmp/api/public/images';

const koaBody = require('koa-body')({
	multipart: true,
	formidable: { uploadDir }
});

const mime = require('mime-types');
const { ifNoneMatch } = require('../helpers/caching');

const prefix = '/api/v1/uploads';
const router = new Router({ prefix });

const postImage = async ctx => {
	const { path, type } = ctx.request.files.upload;
	const ext = mime.extension(type);
	const newName = `${uuidV4()}.${ext}`;
	const newPath = `${fileStore}/${newName}`;
	copyFileSync(path, newPath);
	ctx.status = 201;
	ctx.body = {
		created: true,
		link: `${ctx.protocol}://${ctx.host}${router.url('getImage', newName)}`
	};
};

const getImage = async (ctx, next) => {
	const { uuid } = ctx.params;
	const path = `${fileStore}/${uuid}`;
	if (existsSync(path)) {
		const src = createReadStream(path);
		ctx.type = mime.contentType(uuid);
		ctx.body = src;
		return next();
	}
};

router.post('/', auth, koaBody, postImage);
router.get('getImage', '/:uuid([0-9a-f\\-]{36}\\..+)', getImage, ifNoneMatch);

/* istanbul ignore if */
if (!existsSync('/tmp/api')) {
	mkdirSync('/tmp/api');
	mkdirSync('/tmp/api/uploads');
}


module.exports = router;
