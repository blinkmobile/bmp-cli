'use strict';

// local modules

const api = require('../lib/api.js');
const error = require('../lib/error');
const scope = require('../lib/scope');

// this module

module.exports = function (input, flags, options) {
  if (input[0]) {
    scope.write({ scope: input[0] })
      .catch((err) => {
        console.error(err);
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
    .then((status) => console.log(`${currentScope}: ${status}`))
    .catch((err) => {
      console.error(err);
      error.handle404(err);
      process.exit(1);
    });
};
