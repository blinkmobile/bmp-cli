'use strict'

// Node.js built-ins

const path = require('path')

// foreign modules

const pify = require('pify')
const mkdirp = pify(require('mkdirp'))

// local modules

const httpUtils = require('./utils/http')
const jsonUtils = require('./utils/json')

// this module

const TYPES = [ 'answerspaces', 'interactions' ]

function getDashboard (options) {
  options = options || {}
  const auth = options.auth || {}

  return httpUtils.request({
    credential: auth.credential,
    url: `${auth.origin}/_api/v1/dashboard`,
    reqFn: options.reqFn
  })
}

function getJson (options) {
  options = options || {}
  if (!options.type || !options.id) {
    throw new TypeError('"type" and "id" must be provided')
  }
  if (!~TYPES.indexOf(options.type)) {
    throw new TypeError(`"${options.type}" is not a known type`)
  }

  const auth = options.auth || {}
  return httpUtils.request({
    credential: auth.credential,
    url: `${auth.origin}/_api/v1/${options.type}/${options.id}`,
    reqFn: options.reqFn
  })
}

function pullAnswerSpace (options) {
  options = options || {}
  const auth = options.auth || {}
  const cwd = options.cwd || process.cwd()

  let interactions
  return getDashboard(options)
    .then((obj) => obj.answerSpace.id)
    .then((id) => getJson({ auth, id, type: 'answerspaces' }))
    .then((obj) => {
      const data = Object.assign({}, obj.answerspaces)
      interactions = data.links.interactions
      delete data.links
      delete data.sitemap
      return jsonUtils.write(path.join(cwd, 'answerSpace.json'), data)
    })
    .then(() => mkdirp(path.join(cwd, 'interactions'))
    .then(() => Promise.all(interactions.map((id) => {
      return getJson({ auth, id, type: 'interactions' })
        .then((obj) => {
          const data = Object.assign({}, obj.interactions)
          delete data.links
          return jsonUtils.write(path.join(cwd, 'interactions', `${data.name}.json`), data)
        })
    }))))
}

module.exports = {
  getDashboard,
  getJson,
  pullAnswerSpace
}
