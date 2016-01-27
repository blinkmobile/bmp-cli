'use strict';

// foreign modules

const request = require('request');

// local modules

const jsonUtils = require('./json-utils');
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
    const jar = request.jar();
    auth.credential.split(';').forEach((cookie) => {
      jar.setCookie(request.cookie(cookie), auth.origin);
    });
    const req = options.req || request.defaults({ jar });
    return new Promise((resolve, reject) => {
      req(`${auth.origin}/_api/v1/dashboard`, (err, res, body) => {
        if (err) {
          reject(err);
          return;
        }
        if (res.statusCode !== 200) {
          reject(new Error(res.statusCode));
          return;
        }
        const obj = JSON.parse(body);
        resolve(obj.user);
      });
    });
  }

};
