'use strict'

// local modules

const scope = require('../lib/scope')

// this module

module.exports = function (input, flags, options) {
  scope.read()
    .then((scope) => {
      console.log(scope)
      process.exit(0)
    })
    .catch((err) => {
      console.error(err)
      process.exit(1)
    })
}
