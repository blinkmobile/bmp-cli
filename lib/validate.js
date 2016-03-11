'use strict';

// local modules

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
        throw new Error(`scope-content mismatch: scope=${scope}, name=${space.name}`);
      }
    });
}

module.exports = {
  validateScopeMatchesContent
};
