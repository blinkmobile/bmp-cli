'use strict';

// local modules

const auth = require('./auth');
const httpUtils = require('./utils/http');

// this module

const TYPES = [ 'answerspaces', 'interactions' ];

function assertIdOption (options) {
  if (!options.id) {
    throw new TypeError('"id" must be provided');
  }
}

function assertTypeOption (options) {
  if (!options.type) {
    throw new TypeError('"type" must be provided');
  }
}

function assertKnownTypeOption (options) {
  if (!~TYPES.indexOf(options.type)) {
    throw new TypeError(`"${options.type}" is not a known type`);
  }
}

function assertDataOption (options) {
  if (!options.data || typeof options.data !== 'object') {
    throw new TypeError(`"data" object is mandatory`);
  }
}

function assertMatchingIdOption (options) {
  if (options.id !== options.data.id) {
    throw new TypeError('"id"s in resource and options do not match');
  }
}

function getDashboard () {
  return auth.read()
    .then((a) => httpUtils.sendRequest({
      credential: a.credential,
      url: `${a.origin}/_api/v1/dashboard`
    }));
}

function decorateWithOptionsAssertions (fn, assertions) {
  return (options) => {
    options = options || {};
    assertions.forEach((assert) => assert(options));

    return fn(options);
  };
}

const deleteResource = decorateWithOptionsAssertions((options) => {
  return auth.read()
    .then((a) => httpUtils.sendRequest({
      credential: a.credential,
      method: 'DELETE',
      url: `${a.origin}/_api/v1/${options.type}/${options.id}`
    }));
}, [
  assertIdOption,
  assertTypeOption,
  assertKnownTypeOption
]);

const getResource = decorateWithOptionsAssertions((options) => {
  return auth.read()
    .then((a) => httpUtils.sendRequest({
      credential: a.credential,
      url: `${a.origin}/_api/v1/${options.type}/${options.id}`
    }));
}, [
  assertIdOption,
  assertTypeOption,
  assertKnownTypeOption
]);

const putResource = decorateWithOptionsAssertions((options) => {
  const body = {};
  body[options.type] = options.data;
  let method;
  let urlPath;
  if (options.id) {
    method = 'PUT';
    urlPath = `/_api/v1/${options.type}/${options.id}`;
  } else {
    method = 'POST';
    urlPath = `/_api/v1/${options.type}`;
  }
  return auth.read()
    .then((a) => httpUtils.sendRequest({
      body,
      credential: a.credential,
      method,
      url: `${a.origin}${urlPath}`
    }));
}, [
  assertTypeOption,
  assertKnownTypeOption,
  assertDataOption,
  assertMatchingIdOption
]);

module.exports = {
  deleteResource,
  getDashboard,
  getResource,
  putResource,
  TYPES
};
