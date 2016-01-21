'use strict';

// foreign modules

const request = require('request');

// local modules

const urlUtils = require('./url');

// this module

module.exports = {

  request (options) {
    options = options || {};
    if (!urlUtils.isURL(options.url)) {
      throw new TypeError('expected valid URL');
    }
    const credential = options.credential || '';

    const jar = request.jar();
    credential.split(';').forEach((cookie) => {
      jar.setCookie(request.cookie(cookie), urlUtils.getOrigin(options.url));
    });

    const jarredRequest = options.reqFn || request.defaults({ jar });

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
