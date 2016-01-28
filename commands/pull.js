'use strict';

// local modules

const pull = require('../lib/pull');
const whoami = require('../lib/whoami');

// this module

module.exports = function (input, flags, options) {
  let auth;
  whoami.getAuthentication()
    .then((a) => {
      auth = a;
      return pull.pullAnswerSpace({ auth });
    });
};
