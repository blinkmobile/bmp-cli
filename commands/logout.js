'use strict';

// local modules

const auth = require('../lib/auth');
const logger = require('../lib/utils/logger.js');

// this module

module.exports = function (input, flags, options) {
  return auth.logout()
    .catch((err) => {
      logger.error(err);
      process.exit(1);
    });
};
