'use strict';

// Node.js built-ins

const path = require('path');

// foreign modules

const findUp = require('find-up');
const projectConfig = require('@blinkmobile/blinkmrc').projectConfig;

// local modules

const CONFIG_FILE = require('./values').CONFIG_FILE;
const pkg = require('../package.json');
const urlUtils = require('./utils/url');

// this module

function findConfig () {
  const cwd = process.env.BMP_WORKING_DIR || process.cwd();
  return findUp(CONFIG_FILE, { cwd })
    .then((filePath) => {
      if (!filePath) {
        return Promise.reject(new Error(`${CONFIG_FILE} not found`));
      }
      return filePath;
    });
}

function read () {
  if (process.env.BMP_SCOPE) {
    process.env.BMP_SCOPE = urlUtils.toHTTPS(process.env.BMP_SCOPE);
    if (!urlUtils.isScopeURL(process.env.BMP_SCOPE)) {
      return Promise.reject(new TypeError(`"${process.env.BMP_SCOPE}" is not a valid URL`));
    }
    return Promise.resolve(process.env.BMP_SCOPE);
  }

  return findConfig()
    .then((filePath) => {
      const config = projectConfig({
        cwd: path.dirname(filePath),
        name: pkg.name
      });
      return config.load();
    })
    .then((cfg) => {
      if (!cfg.bmp || !cfg.bmp.scope) {
        return Promise.reject(new Error(`bmp.scope not found in ${CONFIG_FILE}`));
      }
      return cfg.bmp.scope;
    });
}

function getUID () {
  return read()
    .then((s) => urlUtils.getPathSegment(s, 1));
}

module.exports = {

  CONFIG_FILE,
  getUID,
  read,

  write (options) {
    options.scope = urlUtils.toHTTPS(options.scope);
    if (!urlUtils.isScopeURL(options.scope)) {
      return Promise.reject(new TypeError(`"${options.scope}" is not a valid URL`));
    }

    return findConfig()
      .catch(() => {
        const cwd = process.env.BMP_WORKING_DIR || process.cwd();
        // not found, so assume we want to make one in cwd
        return path.join(cwd, CONFIG_FILE);
      })
      .then((filePath) => {
        const config = projectConfig({
          cwd: path.dirname(filePath),
          name: pkg.name
        });
        return config.update((cfg) => {
          cfg.bmp = cfg.bmp || {};
          cfg.bmp.scope = options.scope;
          return cfg;
        });
      });
  }

};
