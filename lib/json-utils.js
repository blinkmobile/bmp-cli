'use strict'

// foreign modules

const loadJson = require('load-json-file')
const writeJson = require('write-json-file')

// this module

function loadJsonObject (filePath) {
  return loadJson(filePath)
    .then((obj) => {
      if (!obj || typeof obj !== 'object') {
        return Promise.reject(new TypeError(`${filePath} does not define a JSON Object`))
      }
      return obj
    })
}

function updateJson (filePath, updater, options) {
  const defaults = {
    indent: 2,
    sortKeys: true
  }
  options = Object.assign({}, defaults, options || {})
  return loadJsonObject(filePath)
    .catch(() => {
      // failed to read, so lets just make new content
      return {}
    })
    .then((obj) => {
      return writeJson(filePath, updater(obj), options)
    })
}

module.exports = {
  loadJsonObject,
  updateJson
}
