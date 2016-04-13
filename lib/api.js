'use strict';

// local modules

const auth = require('./auth');
const getPathSegment = require('./utils/url.js').getPathSegment;
const httpUtils = require('./utils/http');
const scope = require('./scope');

// this module

const TYPES = [ 'answerspaces', 'interactions' ];

function assertIdOption (options) {
  if (!options.id) {
    throw new TypeError('"id" must be provided');
  }
}

function assertOptionsMatchResult (options, result) {
  const resultId = result[options.type].id;
  if (options.id && options.id !== resultId) {
    throw new Error(`request-result mismatch: id=${options.id}, result=${resultId}`);
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
    throw new TypeError('"data" object is mandatory');
  }
}

function assertMatchingIdOption (options) {
  if (options.id !== options.data.id) {
    throw new Error('"id"s in resource and options do not match');
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
    }))
    .then((result) => {
      assertOptionsMatchResult(options, result);
      return result;
    });
}, [
  assertIdOption,
  assertTypeOption,
  assertKnownTypeOption
]);

// temporary, during v1 -> v2 transition
// getAnswerSpaceV2 (options: Object) => Promise
const getAnswerSpaceV2 = (options) => {
  return auth.read()
    .then((a) => httpUtils.sendRequest({
      credential: a.credential,
      url: `${a.origin}/_api/v2/answerspaces/${options.name}`
    }));
};

const CREDS_MISSING = 'no credentials';
const CREDS_GOOD = 'authorised';
const CREDS_BAD = 'access denied';

// getAuthStatus () => Promise
function getAuthStatus () {
  let uid = '';
  return auth.read()
    .then(() => scope.read())
    .then((s) => {
      uid = getPathSegment(s, 1);
    })
    .then(() => getAnswerSpaceV2({ name: uid }))
    .then(() => CREDS_GOOD)
    .catch((err) => {
      if (err.message === '401') {
        return CREDS_BAD;
      }
      if (err.message.indexOf('not yet logged in') === 0) {
        return CREDS_MISSING;
      }
      throw err;
    });
}

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
  CREDS_MISSING,
  CREDS_GOOD,
  CREDS_BAD,
  deleteResource,
  getAnswerSpaceV2,
  getAuthStatus,
  getDashboard,
  getResource,
  putResource,
  TYPES
};
