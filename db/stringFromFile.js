'use strict';

const fs = require('fs');

/**
 * Reads a file as a string.
 * @param {string} path path at which the file is located
 * @returns String from the file read
 */
module.exports = path => fs.readFileSync(fs.realpathSync(path)).toString();
