'use strict';

// local modules

const api = require('./api');
const jsonUtils = require('./utils/json');
const scope = require('./scope');
const urlUtils = require('./utils/url');
const values = require('./values');

// this module

function getAuthentications (options) {
  options = options || {};
  return jsonUtils.loadJsonObject(values.USER_CONFIG_FILE)
    .catch((err) => {
      if (err.code === 'ENOENT') {
        // missing file = not authenticated, which we handle further down
        return {};
      }
      // throw every other error, e.g. corrupt file, bad permissions, etc
      throw err;
    })
    .then((obj) => {
      const bmp = obj.bmp || {};
      return Object.keys(bmp)
        .filter((origin) => !!bmp[origin].credential)
        .map((origin) => {
          const credential = bmp[origin].credential;
          return { origin, credential };
        });
    });
}

function getAuthentication (options) {
  options = options || {};

  let origin;
  return scope.read()
    .then((projectScope) => {
      origin = urlUtils.getOrigin(projectScope || '');
    })
    .then(() => getAuthentications(options))
    .then((auths) => {
      const matches = auths.filter((auth) => auth.origin === origin);
      if (matches.length) {
        return matches[0];
      }
      throw new Error(`not yet logged in for scope origin: ${origin}`);
    });
}

function lookupUser (options) {
  return api.getDashboard(options)
    .then((obj) => obj.user);
}

module.exports = {
  getAuthentication,
  getAuthentications,
  lookupUser
};
