'use strict';

/**
this module exports a pify'ed version of async for convenience
*/

// foreign modules

const async = require('async');
const pify = require('pify');

// this module

module.exports = pify(async, {
  exclude: [
    // https://www.npmjs.com/package/async#utils
    'apply',
    'asyncify',
    'constant',
    'dir',
    'ensureAsync',
    'log',
    'memoize',
    'nextTick',
    'reflect',
    'reflectAll',
    'setImmediate',
    'timeout',
    'unmemoize'
  ]
});
