'use strict';

// local modules

const auth = require('./auth');
const httpUtils = require('./utils/http');
const scope = require('./scope');

// this module

const TYPES = [ 'answerspaces', 'interactions' ];

function assertUidOption (options) {
  if (!options.uid) {
    throw new TypeError('"uid" is mandatory');
  }
}

function assertIdOption (options) {
  if (options.type !== 'answerspaces' && !options.id) {
    throw new TypeError('"id" is mandatory');
  }
}

function assertOptionsMatchResult (options, result) {
  const resultId = result[options.type].id;
  if (options.id && options.id !== resultId) {
    throw new Error(`request-result mismatch: id=${options.id}, result=${resultId}`);
  }
  const resultName = result[options.type].name;
  if (options.type === 'answerspaces' && options.uid !== resultName) {
    throw new Error(`request-result mismatch: name=${options.uid}, result=${resultName}`);
  }
}

function assertTypeOption (options) {
  if (!options.type) {
    throw new TypeError('"type" is mandatory');
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
  if (options.id && options.id !== options.data.id) {
    throw new Error(`"id"s in resource and options do not match: ${options.id}, ${options.data.id}`);
  }
}

function decorateWithOptionsAssertions (fn, assertions) {
  return (options) => {
    options = options || {};
    assertions.forEach((assert) => assert(options));

    return fn(options);
  };
}

const makeResourceURL = (options, a) => {
  let result = `${a.origin}/_api/v2/answerspaces/${options.uid}`;
  if (options.type !== 'answerspaces') {
    result += `/${options.type}`;
    if (options.id) {
      result += `/${options.id}`;
    }
  }
  return result;
};

const deleteResource = decorateWithOptionsAssertions((options) => {
  return auth.read()
    .then((a) => httpUtils.sendRequest({
      credential: a.credential,
      method: 'DELETE',
      url: makeResourceURL(options, a)
    }));
}, [
  assertUidOption,
  assertTypeOption,
  assertKnownTypeOption,
  assertIdOption
]);

const getResource = decorateWithOptionsAssertions((options) => {
  return auth.read()
    .then((a) => httpUtils.sendRequest({
      credential: a.credential,
      url: makeResourceURL(options, a)
    }))
    .then((result) => {
      assertOptionsMatchResult(options, result);
      return result;
    });
}, [
  assertUidOption,
  assertTypeOption,
  assertKnownTypeOption,
  assertIdOption
]);

const CREDS_MISSING = 'no credentials';
const CREDS_GOOD = 'authorised';
const CREDS_BAD = 'access denied';

// getAuthStatus () => Promise
function getAuthStatus () {
  return auth.read()
    .then(() => scope.getUID())
    .then((uid) => getResource({ uid, type: 'answerspaces' }))
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
  if (options.id || options.type === 'answerspaces') {
    method = 'PUT';
  } else {
    method = 'POST';
  }
  return auth.read()
    .then((a) => httpUtils.sendRequest({
      body,
      credential: a.credential,
      method,
      url: makeResourceURL(options, a)
    }));
}, [
  assertUidOption,
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
  getAuthStatus,
  getResource,
  putResource,
  TYPES
};
