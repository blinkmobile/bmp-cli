'use strict'

// Node.js built-ins

const fs = require('fs')

// foreign modules

const pify = require('pify')
const mkdirp = pify(require('mkdirp'))

// local modules

const getOrigin = require('./url-utils').getOrigin
const jsonUtils = require('./json-utils')
const values = require('./values')

// this module

const fsp = pify(fs)

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
  },

  logout (options) {
    options = options || {}
    if (!options.scope) {
      return Promise.reject(new Error('must set project scope first'))
    }
    const userConfigFile = values.userConfigFile(options.userConfigDir)
    const EXITEARLYHACK = 'EXITEARLYHACK'
    return fsp.access(userConfigFile, fs.F_OK)
      .catch(() => {
        return Promise.reject(new Error('EXITEARLYHACK'))
      })
      .then(() => fsp.access(userConfigFile, fs.R_OK | fs.W_OK))
      .then(() => {
        return jsonUtils.updateJson(userConfigFile, (cfg) => {
          cfg.bmp = cfg.bmp || {}
          if (cfg.bmp[getOrigin(options.scope)]) {
            delete cfg.bmp[getOrigin(options.scope)].credential
          }
          return cfg
        }, {
          mode: 0o600
        })
      })
      .catch((err) => {
        if (err.message !== EXITEARLYHACK) {
          return Promise.reject(err)
        }
      })
  }

}
