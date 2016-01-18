'use strict'

// foreign modules

const findUp = require('find-up')
const loadJson = require('load-json-file')

// this module

module.exports = {

  read (options) {
    options = options || {}
    return findUp('.blinkmrc.json', { cwd: options.cwd || process.cwd() })
      .then((filePath) => {
        if (!filePath) {
          return Promise.reject(new Error('unable to determine scope'))
        }
        return loadJson(filePath)
      })
      .then((cfg) => {
        if (!cfg || !cfg.bmp || !cfg.bmp.scope) {
          return Promise.reject(new Error('unable to determine scope'))
        }
        return cfg.bmp.scope
      })
  },

  write () {
    return new Promise((resolve, reject) => {
    })
  }

}
