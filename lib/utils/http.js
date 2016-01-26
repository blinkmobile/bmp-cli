'use strict';

// local modules

const urlUtils = require('./url');

// this module

module.exports = {

  request (options) {
    options = options || {};
    if (!urlUtils.isURL(options.url)) {
      return Promise.reject(new TypeError('expected valid URL'));
    }
    const credential = options.credential || '';

    const jarredRequest = (() => {
      // requesting foreign module at call time to assist with mocking
      const request = require('request');

      if (!request.jar || !request.defaults) {
        return request; // probably mocking request, so just return the mock
      }

      const jar = request.jar();
      credential.split(';').forEach((cookie) => {
        jar.setCookie(request.cookie(cookie), urlUtils.getOrigin(options.url));
      });
      return request.defaults({ jar });
    })();

    return new Promise((resolve, reject) => {
      jarredRequest(urlUtils.toHTTPS(options.url), (err, res, body) => {
        if (err) {
          reject(err);
          return;
        }
        if (res.statusCode !== 200) {
          reject(new Error(res.statusCode));
          return;
        }
        resolve(JSON.parse(body));
      });
    });
  }

};
