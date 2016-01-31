'use strict';

// local modules

const auth = require('./auth');
const httpUtils = require('./utils/http');

// this module

const TYPES = [ 'answerspaces', 'interactions' ];

function assertTypeAndId (options) {
  if (!options.type || !options.id) {
    throw new TypeError('"type" and "id" must be provided');
  }
}

function assertKnownType (options) {
  if (!~TYPES.indexOf(options.type)) {
    throw new TypeError(`"${options.type}" is not a known type`);
  }
}

function getDashboard () {
  return auth.read()
    .then((a) => httpUtils.sendRequest({
      credential: a.credential,
      url: `${a.origin}/_api/v1/dashboard`
    }));
}

function getResource (options) {
  options = options || {};
  assertTypeAndId(options);
  assertKnownType(options);

  return auth.read()
    .then((a) => httpUtils.sendRequest({
      credential: a.credential,
      url: `${a.origin}/_api/v1/${options.type}/${options.id}`
    }));
}

function putResource (options) {
  options = options || {};
  assertTypeAndId(options);
  assertKnownType(options);

  const body = {};
  body[options.type] = options.data;
  return auth.read()
    .then((a) => httpUtils.sendRequest({
      body,
      credential: a.credential,
      method: 'PUT',
      url: `${a.origin}/_api/v1/${options.type}/${options.id}`
    }));
}

module.exports = {
  getDashboard,
  getResource,
  putResource,
  TYPES
};
