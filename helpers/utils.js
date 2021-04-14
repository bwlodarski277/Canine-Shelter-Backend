'use strict';

const fs = require('fs');

/**
 * Restricts a value between a minimum and maximum.
 * @param {number} value value to clamp.
 * @param {number} min value minimum.
 * @param {number} max value maximum.
 * @returns {number} clamped value.
 */
exports.clamp = (value, min, max) => Math.max(min, Math.min(value, max));

/**
 * Reads a file as a string.
 * @param {string} path path at which the file is located
 * @returns String from the file read
 */
exports.stringFromFile = path => fs.readFileSync(fs.realpathSync(path)).toString();
