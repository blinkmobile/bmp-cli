'use strict';

// local modules

const urlUtils = require('./url');

// this module

function makeRequester (options) {
  options = options || {};

  // requesting foreign module at call time to assist with mocking
  const request = require('request');

  if (!request.jar || !request.defaults) {
    return request; // probably mocking request, so just return the mock
  }

  const credential = options.credential || '';
  const jar = request.jar();
  credential.split(';').forEach((cookie) => {
    jar.setCookie(request.cookie(cookie), options.origin);
  });
  return request.defaults({ jar, json: true });
}

let requester;

function sendRequest (options) {
  options = options || {};
  if (!urlUtils.isURL(options.url)) {
    return Promise.reject(new TypeError('expected valid URL'));
  }

  options.url = urlUtils.toHTTPS(options.url);

  requester = requester || makeRequester({
    credential: options.credential,
    origin: urlUtils.getOrigin(options.url)
  });

  return new Promise((resolve, reject) => {
    requester({
      body: options.body,
      method: options.method || 'GET',
      url: options.url
    }, (err, res, body) => {
      if (err) {
        reject(err);
        return;
      }
      if (!~[200, 201, 204].indexOf(res.statusCode)) {
        reject(new Error(res.statusCode));
        console.error(options.url, res.statusCode, body);
        return;
      }
      resolve(typeof body === 'string' ? JSON.parse(body) : body);
    });
  });
}

module.exports = { sendRequest };
