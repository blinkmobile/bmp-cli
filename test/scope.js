'use strict'

// Node.js built-ins

const fs = require('fs')
const path = require('path')

// foreign modules

const pify = require('pify')
const test = require('ava')

// local modules

const lib = require('../lib/scope')

// this module

const fsp = pify(fs)

test.afterEach((t) => {
  const tempFile = path.join(process.cwd(), lib.CONFIG_FILE)
  fsp.access(tempFile, fs.F_OK | fs.W_OK)
    .then(() => fsp.unlink(tempFile))
    .catch(() => Promise.resolve()) // swallow errors
})

test.serial('read missing .blinkmrc.json', (t) => {
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

test('read empty .blinkmrc.json', (t) => {
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

test('read .blinkmrc.json in same directory', (t) => {
  const cwd = path.join(__dirname, 'fixtures', 'scope')
  return lib.read({ cwd })
    .then((scope) => {
      t.is(scope, 'https://example.com/space')
    })
})

test('read .blinkmrc.json in parent directory', (t) => {
  const cwd = path.join(__dirname, 'fixtures', 'scope', 'sub')
  return lib.read({ cwd })
    .then((scope) => {
      t.is(scope, 'https://example.com/space')
    })
})

test.serial('write invalid scope URL to .blinkmrc.json', (t) => {
  const cwd = process.cwd()
  return lib.write({ cwd, scope: 'abc' })
    .then(() => {
      t.fail()
    })
    .catch((err) => {
      t.ok(err)
      return Promise.resolve()
    })
})

test.serial('write to .blinkmrc.json in same directory', (t) => {
  const cwd = process.cwd()
  return lib.write({ cwd, scope: 'https://example.com/space' })
    .then(() => lib.read({ cwd }))
    .then((scope) => {
      t.is(scope, 'https://example.com/space')
    })
})

test.serial('update to .blinkmrc.json in parent directory', (t) => {
  const cwd = path.join(process.cwd(), 'test')
  return lib.write({ cwd: process.cwd(), scope: 'https://example.com/space' })
    .then(() => lib.write({ cwd, scope: 'https://example.com/abcdef' }))
    .then(() => lib.read({ cwd }))
    .then((scope) => {
      t.is(scope, 'https://example.com/abcdef')
    })
})
