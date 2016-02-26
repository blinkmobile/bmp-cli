'use strict';

// Node.js built-ins

const path = require('path');

// foreign modules

const findUp = require('find-up');
const projectConfig = require('@blinkmobile/blinkmrc').projectConfig;

// local modules

const CONFIG_FILE = require('./values').CONFIG_FILE;
const isURL = require('./utils/url').isURL;
const pkg = require('../package.json');

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

module.exports = {

  CONFIG_FILE,

  read () {
    if (process.env.BMP_SCOPE) {
      if (!isURL(process.env.BMP_SCOPE)) {
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
  },

  write (options) {
    if (!isURL(options.scope)) {
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
