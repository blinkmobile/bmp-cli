'use strict';

// Node.js built-ins

const fs = require('fs');

// foreign modules

const pify = require('pify');
const mkdirp = pify(require('mkdirp'));

// local modules

const getOrigin = require('./utils/url').getOrigin;
const jsonUtils = require('./utils/json');
const scope = require('./scope');
const values = require('./values');

// this module

const fsp = pify(fs);

module.exports = {

  login (options) {
    options = options || {};

    let projectScope;
    return scope.read()
      .then((s) => {
        projectScope = s;
      })
      .catch(() => {
        throw new Error('must set project scope first');
      })
      .then(() => mkdirp(values.USER_CONFIG_DIR))
      .then(() => {
        return jsonUtils.updateJson(values.USER_CONFIG_FILE, (cfg) => {
          cfg.bmp = cfg.bmp || {};
          cfg.bmp[getOrigin(projectScope)] = {
            credential: options.credential
          };
          return cfg;
        }, {
          mode: 0o600
        });
      });
  },

  logout (options) {
    options = options || {};
    const EXITEARLYHACK = 'EXITEARLYHACK';

    let projectScope;
    return scope.read()
      .then((s) => {
        projectScope = s;
      })
      .catch(() => {
        throw new Error('must set project scope first');
      })
      .then(() => fsp.access(values.USER_CONFIG_FILE, fs.F_OK))
      .catch(() => {
        return Promise.reject(new Error('EXITEARLYHACK'));
      })
      .then(() => fsp.access(values.USER_CONFIG_FILE, fs.R_OK | fs.W_OK))
      .then(() => {
        return jsonUtils.updateJson(values.USER_CONFIG_FILE, (cfg) => {
          cfg.bmp = cfg.bmp || {};
          const origin = getOrigin(projectScope);
          if (cfg.bmp[origin]) {
            delete cfg.bmp[origin].credential;
          }
          return cfg;
        }, {
          mode: 0o600
        });
      })
      .catch((err) => {
        if (err.message !== EXITEARLYHACK) {
          return Promise.reject(err);
        }
      });
  }

};
