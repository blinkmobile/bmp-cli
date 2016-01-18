'use strict'

// local modules

const scope = require('../lib/scope')

// this module

module.exports = function (input, flags, options) {
  if (input[0]) {
    scope.write({ scope: input[0] })
      .catch((err) => {
        console.error(err)
        process.exit(1)
      })
    return
  }

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
