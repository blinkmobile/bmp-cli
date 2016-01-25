'use strict';

// local modules

const jsonUtils = require('./utils/json');
const pull = require('./pull');
const urlUtils = require('./utils/url');
const values = require('./values');

// this module

module.exports = {

  getAuthentication (options) {
    options = options || {};
    const userConfigFile = values.userConfigFile(options.userConfigDir);
    const origin = urlUtils.getOrigin(options.scope || '');
    return jsonUtils.loadJsonObject(userConfigFile)
      .catch(() => [])
      .then((obj) => {
        const bmp = obj.bmp || {};
        bmp[origin] = bmp[origin] || {};
        if (!bmp[origin].credential) {
          throw new Error(`not yet logged in for scope: ${options.scope}`);
        }
        return { origin, credential: bmp[origin].credential };
      });
  },

  getAuthentications (options) {
    options = options || {};
    const userConfigFile = values.userConfigFile(options.userConfigDir);
    return jsonUtils.loadJsonObject(userConfigFile)
      .catch(() => [])
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
    return pull.getDashboard(options)
      .then((obj) => obj.user);
  }

};