'use strict';

/**
 * Restricts a value between a minimum and maximum.
 * @param {number} value value to clamp.
 * @param {number} min value minimum.
 * @param {number} max value maximum.
 * @returns {number} clamped value.
 */
exports.clamp = (value, min, max) => Math.max(min, Math.min(value, max));
