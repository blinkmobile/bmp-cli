'use strict';

// Node.js built-ins

const fs = require('fs');

// foreign modules

const pify = require('pify');
const mkdirp = pify(require('mkdirp'));

// local modules

const jsonUtils = require('./utils/json');
const scope = require('./scope');
const urlUtils = require('./utils/url');
const values = require('./values');

// this module

const fsp = pify(fs);

function login (options) {
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
        const origin = urlUtils.getOrigin(projectScope);
        cfg.bmp[origin] = {
          credential: options.credential
        };
        return cfg;
      }, {
        mode: 0o600
      });
    });
}

function logout () {
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
        const origin = urlUtils.getOrigin(projectScope);
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

function readAll () {
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
}

function read () {
  let origin;
  return scope.read()
    .then((projectScope) => {
      origin = urlUtils.getOrigin(urlUtils.toHTTPS(projectScope) || '');
    })
    .then(readAll)
    .then((auths) => {
      const matches = auths.filter((a) => a.origin === origin);
      if (matches.length) {
        return matches[0];
      }
      throw new Error(`not yet logged in for scope origin: ${origin}`);
    });
}

module.exports = {
  login,
  logout,
  read,
  readAll
};
