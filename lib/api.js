'use strict';

// local modules

const auth = require('./auth');
const httpUtils = require('./utils/http');

// this module

const TYPES = [ 'answerspaces', 'interactions' ];

function getDashboard () {
  return auth.read()
    .then((a) => httpUtils.request({
      credential: a.credential,
      url: `${a.origin}/_api/v1/dashboard`
    }));
}

function getResource (options) {
  options = options || {};
  if (!options.type || !options.id) {
    throw new TypeError('"type" and "id" must be provided');
  }
  if (!~TYPES.indexOf(options.type)) {
    throw new TypeError(`"${options.type}" is not a known type`);
  }

  return auth.read()
    .then((a) => httpUtils.request({
      credential: a.credential,
      url: `${a.origin}/_api/v1/${options.type}/${options.id}`
    }));
}

module.exports = {
  getDashboard,
  getResource,
  TYPES
};
