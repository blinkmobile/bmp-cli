'use strict';

// local modules

const pull = require('../lib/pull');

// this module

module.exports = function (input, flags, options) {
  return pull.pullAll();
};
