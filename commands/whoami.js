'use strict';

// foreign modules

const pify = require('pify');
const async = require('async');
const elegantSpinner = require('elegant-spinner');
const logUpdate = require('log-update');

// local modules

const whoami = require('../lib/whoami');

// this module

const pasync = pify(require('async'));

function logAuthLookup (auth) {
  const frame = elegantSpinner();
  let timer = setInterval(() => {
    logUpdate(`${auth.origin}: ${frame()}`);
  }, 100);
  return whoami.lookupUser({ auth })
    .then((result) => {
      logUpdate(`${auth.origin}: ${result.name} <${result.email}>`);
      clearTimeout(timer);
    })
    .catch((err) => {
      clearTimeout(timer);
      return Promise.reject(err);
    });
}

module.exports = function (input, flags, options) {
  whoami.getAuthentications()
    .then((auths) => {
      if (auths.length) {
        return pasync.eachSeries(auths, async.asyncify(logAuthLookup));
      }
      console.log('no authentication data found');
    });
};
