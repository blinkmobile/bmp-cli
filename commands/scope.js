'use strict';

// local modules

const api = require('../lib/api.js');
const error = require('../lib/error');
const logger = require('../lib/utils/logger.js');
const scope = require('../lib/scope');

// this module

module.exports = function (input, flags, options) {
  if (input[0]) {
    scope.write({ scope: input[0] })
      .catch((err) => {
        logger.error(err);
        process.exit(1);
      });
    return;
  }

  let currentScope;
  scope.read()
    .then((s) => {
      currentScope = s;
    })
    .then(() => api.getAuthStatus())
    .then((status) => logger.log(`${currentScope}: ${status}`))
    .catch((err) => {
      error.handle404(err);
      error.handleScopeNotSet(err);
      logger.error(err);
      process.exit(1);
    });
};
