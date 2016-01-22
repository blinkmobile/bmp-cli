'use strict';

// local modules

const pull = require('../lib/pull');
const scope = require('../lib/scope');
const whoami = require('../lib/whoami');

// this module

module.exports = function (input, flags, options) {
  let projectScope;
  let auth;
  scope.read()
    .then((s) => {
      projectScope = s;
      return whoami.getAuthentication({ scope: projectScope });
    })
    .then((a) => {
      auth = a;
      return pull.pullAnswerSpace({ auth, scope: projectScope });
    });
};
