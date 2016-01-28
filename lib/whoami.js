'use strict';

// local modules

const api = require('./api');
const jsonUtils = require('./utils/json');
const urlUtils = require('./utils/url');
const values = require('./values');

// this module

module.exports = {

  getAuthentication (options) {
    options = options || {};
    const origin = urlUtils.getOrigin(options.scope || '');
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
        bmp[origin] = bmp[origin] || {};
        if (!bmp[origin].credential) {
          throw new Error(`not yet logged in for scope: ${origin}`);
        }
        return { origin, credential: bmp[origin].credential };
      });
  },

  getAuthentications (options) {
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
  },

  lookupUser (options) {
    return api.getDashboard(options)
      .then((obj) => obj.user);
  }

};
