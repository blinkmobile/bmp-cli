'use strict'

// foreign modules

const prompt = require('prompt')

// local modules

const auth = require('../lib/auth')
const scope = require('../lib/scope')

// this module

function promptCredential () {
  return new Promise((resolve, reject) => {
    prompt.start()
    prompt.get({
      properties: {
        credential: {
          hidden: true,
          message: 'token or cookie, input is hidden',
          required: true
        }
      }
    }, (err, result) => {
      if (err) {
        reject(err)
        return
      }
      resolve(result)
    })
  })
}

function getCredential (input) {
  if (!input || !input[0]) {
    return promptCredential()
  }
  return Promise.resolve(input[0])
}

module.exports = function (input, flags, options) {
  let projectScope
  scope.read()
    .then((s) => { projectScope = s })
    .catch(() => Promise.reject(new Error('must set project scope first')))
    .then(() => getCredential(input))
    .then((credential) => auth.login({ credential, scope: projectScope }))
    .catch((err) => {
      console.error(err)
      process.exit(1)
    })
}
