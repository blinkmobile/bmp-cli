'use strict';

// local modules

const httpUtils = require('./utils/http');
const jsonUtils = require('./utils/json');
const values = require('./values');

// this module

module.exports = {

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
    options = options || {};
    const auth = options.auth || {};

    return httpUtils.request({
      credential: auth.credential,
      url: `${auth.origin}/_api/v1/dashboard`,
      reqFn: options.reqFn
    })
      .then((obj) => obj.user);
  }

};
