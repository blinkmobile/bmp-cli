'use strict';

// foreign modules

const prompt = require('prompt');

// local modules

const api = require('../lib/api.js');
const auth = require('../lib/auth');
const getPathSegment = require('../lib/utils/url.js').getPathSegment;
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
  let uid = '';
  let currentScope = '';
  scope.read()
    .then((s) => {
      currentScope = s;
      uid = getPathSegment(s, 1);
    })
    .catch(() => Promise.reject(new Error('must set project scope first')))
    .then(() => getCredential(input))
    .then((credential) => auth.login({ credential }))
    .then(() => api.getAnswerSpaceV2({ name: uid }))
    .then(() => console.log(`successfully authorised for ${currentScope}`))
    .catch((err) => {
      if (err.message === '401') {
        console.error(`denied access to ${currentScope}, try a new token`);
        return auth.logout();
      }
      console.error(err);
      process.exit(1);
    });
};
