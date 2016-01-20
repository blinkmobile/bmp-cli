'use strict'

// Node.js built-ins

const path = require('path')

// foreign modules

const findUp = require('find-up')
const loadJson = require('load-json-file')
const writeJson = require('write-json-file')

// local modules

const CONFIG_FILE = require('./values').CONFIG_FILE
const isURL = require('./url-utils').isURL

// this module

function findConfig (options) {
  return findUp(CONFIG_FILE, { cwd: options.cwd || process.cwd() })
    .then((filePath) => {
      if (!filePath) {
        return Promise.reject(new Error(`${CONFIG_FILE} not found`))
      }
      return filePath
    })
}

function readConfig (filePath) {
  return loadJson(filePath)
    .then((cfg) => {
      if (!cfg || typeof cfg !== 'object') {
        return Promise.reject(`${CONFIG_FILE} does not define a JSON Object`)
      }
      return cfg
    })
}

module.exports = {

  CONFIG_FILE,

  read (options) {
    options = options || {}
    return findConfig(options)
      .then((filePath) => readConfig(filePath))
      .then((cfg) => {
        if (!cfg.bmp || !cfg.bmp.scope) {
          return Promise.reject(new Error(`bmp.scope not found in ${CONFIG_FILE}`))
        }
        return cfg.bmp.scope
      })
  },

  write (options) {
    options = options || {}
    if (!isURL(options.scope)) {
      return Promise.reject(new TypeError(`"${options.scope}" is not a valid URL`))
    }

    let cfg
    let filePath
    return findConfig(options)
      .catch(() => {
        // not found, so assume we want to make one in cwd
        return path.join(process.cwd(), CONFIG_FILE)
      })
      .then((fp) => {
        filePath = fp
        return readConfig(filePath)
      })
      .catch(() => {
        // failed to read, so lets just make new content
        return {}
      })
      .then((c) => {
        cfg = c
        cfg.bmp = cfg.bmp || {}
        cfg.bmp.scope = options.scope
        return writeJson(filePath, cfg, {
          indent: 2,
          sortKeys: true
        })
      })
  }

}
