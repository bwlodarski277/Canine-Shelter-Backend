'use strict';

/* istanbul ignore file */

/* eslint-disable camelcase */
const Twit = require('twit');
const { twitter: config } = require('../config').config;

const twit = new Twit({
	consumer_key: config.apiKey,
	consumer_secret: config.apiSecretKey,
	access_token: config.accessToken,
	access_token_secret: config.accessTokenSecret
});

/**
 * Tweets a block of text and a URL on the Canine Shelter Twitter page.
 * {@link https://twitter.com/CanineShelter}
 * @param {string} text
 * @param {string} link
 * @returns {boolean} value indicating whether the tweet was posted or not.
 * @async
 */
exports.tweet = async (text = '', link = '') => {
	// The Twitter API converts URLs to t.co shortened links, which
	// are made up of 23 characters.
	let status = '';
	// Take away extra 4 for '...\n'
	if (text.length + 23 > 280) status = `${text.substr(0, text.length - 23 - 4)}...\n${link}`;
	else status = `${text}\n${link}`;
	try {
		await twit.post('statuses/update', { status });
		return true;
	} catch (error) {
		console.error(error);
		return false;
	}
};
