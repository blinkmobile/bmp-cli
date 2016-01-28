'use strict';

// local modules

const auth = require('../lib/auth');

// this module

module.exports = function (input, flags, options) {
  auth.logout()
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
};
