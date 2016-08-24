'use strict';

// foreign modules

const prompt = require('prompt');

// local modules

const api = require('../lib/api.js');
const auth = require('../lib/auth');
const error = require('../lib/error');
const logger = require('../lib/utils/logger.js');
const isValidJWT = require('../lib/utils/jwt.js').isValidJWT;
const scope = require('../lib/scope');

// this module

function promptCredential () {
  return new Promise((resolve, reject) => {
    prompt.start();
    prompt.get({
      properties: {
        credential: {
          conform: (string) => isValidJWT(string),
          description: 'token',
          hidden: true,
          message: 'must be a valid JSON Web Token (JWT)',
          replace: '*',
          required: true
        }
      }
    }, (err, result) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(result.credential);
    });
  });
}

function getCredential (input) {
  if (!input || !input[0]) {
    return promptCredential();
  }
  return Promise.resolve(input[0]);
}

module.exports = function (input, flags, options) {
  let currentScope = '';
  scope.read()
    .then((s) => {
      currentScope = s;
    })
    .catch(() => Promise.reject(new Error('must set project scope first')))
    .then(() => getCredential(input))
    .then((credential) => auth.login({ credential }))
    .then(() => api.getAuthStatus())
    .then((status) => {
      if (status === api.CREDS_GOOD) {
        logger.log(`authorised for ${currentScope}`);
        return;
      }
      logger.error(`denied access to ${currentScope}, try a new token`);
      return auth.logout();
    })
    .catch((err) => {
      error.handle404(err);
      logger.error(err);
      process.exit(1);
    });
};
