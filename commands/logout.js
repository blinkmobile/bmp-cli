'use strict';

// local modules

const auth = require('../lib/auth');
const scope = require('../lib/scope');

// this module

module.exports = function (input, flags, options) {
  let projectScope;
  scope.read()
    .then((s) => { projectScope = s; })
    .catch(() => Promise.reject(new Error('must set project scope first')))
    .then(() => auth.logout({ scope: projectScope }))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
};
