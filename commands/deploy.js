'use strict';

// local modules

const deploy = require('../lib/deploy');

// this module

module.exports = function (input, flags, options) {
  return deploy.deployAll();
};
