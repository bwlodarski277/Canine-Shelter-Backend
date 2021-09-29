/* eslint-disable max-len */
'use strict';

exports.config = {
	host: process.env.DB_HOST || 'localhost',
	port: process.env.DB_PORT || 3306,
	user: process.env.DB_USER || 'root',
	password: process.env.DB_PASSWORD || 'root',
	database: process.env.DB_DATABASE || 'canine_shelter',
	testDatabase: 'canine_test_db',
	connectionLimit: 100,
	staffKey: process.env.STAFF_KEY || '',
	jwtSecret: process.env.JWT_SECRET || '',
	jwtRefresh: process.env.JWT_REFRESH || '',
	googleOauth: {
		clientID: process.env.G_ID || '',
		clientSecret: process.env.G_SECRET || ''
	},
	twitter: {
		apiKey: process.env.T_API || '',
		apiSecretKey: process.env.T_SECRET || '',
		bearerToken: process.env.T_BEARER || '',
		accessToken: process.env.T_ACCESS || '',
		accessTokenSecret: process.env.T_ACCESS_SECRET || ''
	},
	uploadDir: process.env.UPLOAD_DIR || '/tmp/api/uploads',
	fileStore: process.env.FILE_STORE || '/var/tmp/api/public/images'
};
