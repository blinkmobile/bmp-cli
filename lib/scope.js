'use strict';

// Node.js built-ins

const path = require('path');

// foreign modules

const findUp = require('find-up');

// local modules

const CONFIG_FILE = require('./values').CONFIG_FILE;
const isURL = require('./utils/url').isURL;
const jsonUtils = require('./utils/json');

// this module

function findConfig (options) {
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

  read (options) {
    options = options || {};
    return findConfig(options)
      .then((filePath) => jsonUtils.loadJsonObject(filePath))
      .then((cfg) => {
        if (!cfg.bmp || !cfg.bmp.scope) {
          return Promise.reject(new Error(`bmp.scope not found in ${CONFIG_FILE}`));
        }
        return cfg.bmp.scope;
      });
  },

  write (options) {
    options = options || {};
    if (!isURL(options.scope)) {
      return Promise.reject(new TypeError(`"${options.scope}" is not a valid URL`));
    }

    let filePath;
    return findConfig(options)
      .catch(() => {
        const cwd = process.env.BMP_WORKING_DIR || process.cwd();
        // not found, so assume we want to make one in cwd
        return path.join(cwd, CONFIG_FILE);
      })
      .then((fp) => {
        filePath = fp;
        return jsonUtils.updateJson(filePath, (cfg) => {
          cfg.bmp = cfg.bmp || {};
          cfg.bmp.scope = options.scope;
          return cfg;
        });
      });
  }

};
