'use strict';

// local modules

const error = require('./error.js');
const readAnswerSpace = require('./resource').readAnswerSpace;
const scope = require('./scope');

// this module

function validateScopeMatchesContent (options) {
  return Promise.all([
    scope.read(),
    readAnswerSpace(options).catch(() => ({}))
  ])
    .then((results) => {
      const scope = results[0];
      const space = results[1];
      if (!space.name) {
        return;
      }
      if (!scope.endsWith(`/${space.name}`)) {
        const err = new Error(error.ERROR_SCOPE_CONTENT_MISMATCH);
        err.data = {
          content: space.name,
          scope,
          suggestedScope: scope.replace(/\/[^\/]+$/, `/${space.name}`)
        };
        throw err;
      }
    });
}

module.exports = {
  validateScopeMatchesContent
};
