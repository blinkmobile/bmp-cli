'use strict';

// foreign modules

const pify = require('pify');
const async = require('async');
const elegantSpinner = require('elegant-spinner');
const logUpdate = require('log-update');

// local modules

const auth = require('../lib/auth');
const whoami = require('../lib/whoami');

// this module

const pasync = pify(require('async'));

function logAuthLookup (options) {
  const frame = elegantSpinner();
  let timer = setInterval(() => {
    logUpdate(`${options.origin}: ${frame()}`);
  }, 100);
  return whoami.lookupUser()
    .then((result) => {
      logUpdate(`${options.origin}: ${result.name} <${result.email}>`);
      clearTimeout(timer);
    })
    .catch((err) => {
      clearTimeout(timer);
      return Promise.reject(err);
    });
}

module.exports = function (input, flags, options) {
  auth.readAll()
    .then((auths) => {
      if (auths.length) {
        return pasync.eachSeries(auths, async.asyncify(logAuthLookup));
      }
      console.log('no authentication data found');
    });
};
