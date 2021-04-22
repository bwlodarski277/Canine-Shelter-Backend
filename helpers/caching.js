'use strict';

const etag = require('etag');

/**
 * Uses the If-Modified-Since header to see if the API needs to return data.
 * @param {object} ctx Koa object passed by previous middleware
 * @param {function} next next function to call in the middleware chain
 * @async
 */
exports.ifModifiedSince = async (ctx, next) => {
	ctx.set('Last-Modified', new Date(ctx.body.modified).toUTCString());
	ctx.set('ETag', etag(JSON.stringify(ctx.body)));
	const { ['if-modified-since']: ifModifiedSince } = ctx.headers;
	if (ifModifiedSince) {
		const since = Date.parse(ifModifiedSince);
		const modified = new Date(ctx.body.modified);
		if (modified < since) ctx.status = 304;
	}
	return next();
};

/**
 * Uses the If-None-Match header to see if the API needs to return data.
 * @param {object} ctx Koa object passed by previous middleware
 * @param {function} next next function to call in the middleware chain
 * @async
 */
exports.ifNoneMatch = async (ctx, next) => {
	ctx.set('ETag', etag(JSON.stringify(ctx.body)));
	const { ['if-none-match']: ifNoneMatch } = ctx.headers;
	if (ifNoneMatch) {
		const current = etag(JSON.stringify(ctx.body));
		if (ifNoneMatch === current) ctx.status = 304;
	}
	return next();
};
