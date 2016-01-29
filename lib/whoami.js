'use strict';

// local modules

const api = require('./api');

// this module

function lookupUser () {
  return api.getDashboard()
    .then((obj) => obj.user);
}

module.exports = {
  lookupUser
};
