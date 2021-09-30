/* eslint-disable camelcase */
'use strict';

const Router = require('koa-router');
const { v4: uuidV4 } = require('uuid');
const cloudinary = require('cloudinary').v2;
const fetch = require('node-fetch');
const { pipeline } = require('stream/promises');
const { existsSync, copyFileSync, createReadStream, mkdirSync } = require('fs');
const { auth } = require('../controllers/auth');
const { uploadDir, fileStore, cloudinary: cloudConfig } = require('../config').config;

const koaBody = require('koa-body')({
	multipart: true,
	formidable: { uploadDir }
});

const mime = require('mime-types');
const { ifNoneMatch } = require('../helpers/caching');

const prefix = '/api/v1/uploads';
const router = new Router({ prefix });

if (cloudConfig.api_key) cloudinary.config(cloudConfig);

const postImage = async ctx => {
	const { path, type } = ctx.request.files.upload;
	const ext = mime.extension(type);
	const uuid = uuidV4();
	const newName = `${uuid}.${ext}`;
	const newPath = `${fileStore}/${newName}`;
	if (cloudConfig.api_key) await cloudinary.uploader.upload(path, { public_id: uuid });
	else copyFileSync(path, newPath);
	ctx.status = 201;
	ctx.body = {
		created: true,
		link: `${ctx.protocol}://${ctx.host}${router.url('getImage', newName)}`
	};
};

const getImage = async (ctx, next) => {
	const { uuid } = ctx.params;
	const path = `${fileStore}/${uuid}`;
	if (cloudConfig.api_key) {
		const imageUrl = cloudinary.url(uuid);
		const res = await fetch(imageUrl);
		ctx.type = mime.contentType(uuid);
		await pipeline(res, ctx.body);
		return next();
	} else if (existsSync(path)) {
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
