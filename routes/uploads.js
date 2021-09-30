'use strict';

const Router = require('koa-router');
const { v4: uuidV4 } = require('uuid');
const { existsSync, copyFileSync, createReadStream, mkdirSync } = require('fs');
const { auth } = require('../controllers/auth');
const { uploadDir, fileStore } = require('../config').config;

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

if (!existsSync(uploadDir)) mkdirSync(uploadDir, { recursive: true });
if (!existsSync(fileStore)) mkdirSync(fileStore, { recursive: true });

module.exports = router;
