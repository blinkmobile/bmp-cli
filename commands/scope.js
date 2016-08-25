'use strict';

// local modules

const api = require('../lib/api.js');
const error = require('../lib/error');
const logger = require('../lib/utils/logger.js');
const scope = require('../lib/scope');

// this module

module.exports = function (input, flags, options) {
  if (input[0]) {
    return scope.write({ scope: input[0] })
      .catch((err) => {
        error.handleScopeInvalid(err);
        logger.error(err);
        process.exit(1);
      });
  }

  let currentScope;
  return scope.read()
    .then((s) => {
      currentScope = s;
    })
    .then(() => api.getAuthStatus())
    .then((status) => logger.log(`${currentScope}: ${status}`));
};
