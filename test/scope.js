'use strict'

// Node.js built-ins

const path = require('path')

// foreign modules

const test = require('ava')

// local modules

const lib = require('../lib/scope')

// this module

test('no .blinkmrc.json', (t) => {
  const cwd = process.cwd()
  return lib.read({ cwd })
    .then(() => {
      t.fail()
    })
    .catch((err) => {
      t.ok(err)
      return Promise.resolve()
    })
})

test('empty .blinkmrc.json', (t) => {
  const cwd = path.join(__dirname, 'fixtures', 'scope', 'empty')
  return lib.read({ cwd })
    .then(() => {
      t.fail()
    })
    .catch((err) => {
      t.ok(err)
      return Promise.resolve()
    })
})

test('.blinkmrc.json in same directory', (t) => {
  const cwd = path.join(__dirname, 'fixtures', 'scope')
  return lib.read({ cwd })
    .then((scope) => {
      t.is(scope, 'https://example.com/space')
    })
})

test('.blinkmrc.json in parent directory', (t) => {
  const cwd = path.join(__dirname, 'fixtures', 'scope', 'sub')
  return lib.read({ cwd })
    .then((scope) => {
      t.is(scope, 'https://example.com/space')
    })
})
