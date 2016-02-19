'use strict';

// foreign modules

const userConfig = require('@blinkmobile/blinkmrc').userConfig;

// local modules

const pkg = require('../package.json');
const scope = require('./scope');
const urlUtils = require('./utils/url');

// this module

function makeConfig () {
  return userConfig({
    name: pkg.name,
    userConfigDir: process.env.BMP_USER_CONFIG_DIR
  });
}

function login (options) {
  options = options || {};
  const config = makeConfig();

  return scope.read()
    .catch(() => {
      throw new Error('must set project scope first');
    })
    .then((s) => urlUtils.getOrigin(urlUtils.toHTTPS(s) || ''))
    .then((origin) => config.update((cfg) => {
      cfg.bmp = cfg.bmp || {};
      cfg.bmp[origin] = {
        credential: options.credential
      };
      return cfg;
    }));
}

function logout () {
  const config = makeConfig();

  return scope.read()
    .catch(() => {
      throw new Error('must set project scope first');
    })
    .then((s) => urlUtils.getOrigin(s))
    .then((origin) => config.update((cfg) => {
      cfg.bmp = cfg.bmp || {};
      if (cfg.bmp[origin]) {
        delete cfg.bmp[origin].credential;
      }
      return cfg;
    }));
}

function readAll () {
  const config = makeConfig();

  return config.load()
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
  return scope.read()
    .then((s) => Promise.all([
      urlUtils.getOrigin(urlUtils.toHTTPS(s) || ''),
      readAll()
    ]))
    .then((result) => {
      const origin = result[0];
      const auths = result[1];
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
