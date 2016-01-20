'use strict'

// foreign modules

const pify = require('pify')
const mkdirp = pify(require('mkdirp'))

// local modules

const getOrigin = require('./url-utils').getOrigin
const jsonUtils = require('./json-utils')
const values = require('./values')

// this module

module.exports = {

  login (options) {
    options = options || {}
    if (!options.scope) {
      return Promise.reject(new Error('must set project scope first'))
    }
    const userConfigDir = options.userConfigDir || values.USER_CONFIG_DIR
    const userConfigFile = values.userConfigFile(options.userConfigDir)
    return mkdirp(userConfigDir)
      .then(() => {
        return jsonUtils.updateJson(userConfigFile, (cfg) => {
          cfg.bmp = cfg.bmp || {}
          cfg.bmp[getOrigin(options.scope)] = {
            credential: options.credential
          }
          return cfg
        }, {
          mode: 0o600
        })
      })
  }

}
