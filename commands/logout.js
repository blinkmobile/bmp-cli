'use strict';

// local modules

const auth = require('../lib/auth');

// this module

module.exports = function (input, flags, options) {
  return auth.logout();
};
