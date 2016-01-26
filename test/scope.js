'use strict';

// Node.js built-ins

const path = require('path');

// foreign modules

const pify = require('pify');
const temp = pify(require('temp').track());
const test = require('ava');

// local modules

const lib = require('../lib/scope');
const pkg = require('../package.json');

// this module

test.beforeEach((t) => {
  return temp.mkdir(pkg.name.replace(/\//g, '-') + '-')
    .then((dirPath) => {
      t.context.tempDir = dirPath;
    });
});

test.serial('read missing .blinkmrc.json', (t) => {
  const cwd = t.context.tempDir;
  return lib.read({ cwd })
    .then((result) => {
      console.log(result);
      t.fail();
    })
    .catch((err) => {
      t.ok(err);
      return Promise.resolve();
    });
});

test('read empty .blinkmrc.json', (t) => {
  const cwd = path.join(__dirname, 'fixtures', 'scope', 'empty');
  return lib.read({ cwd })
    .then(() => {
      t.fail();
    })
    .catch((err) => {
      t.ok(err);
      return Promise.resolve();
    });
});

test('read .blinkmrc.json in same directory', (t) => {
  const cwd = path.join(__dirname, 'fixtures', 'scope');
  return lib.read({ cwd })
    .then((scope) => {
      t.is(scope, 'https://example.com/space');
    });
});

test('read .blinkmrc.json in parent directory', (t) => {
  const cwd = path.join(__dirname, 'fixtures', 'scope', 'sub');
  return lib.read({ cwd })
    .then((scope) => {
      t.is(scope, 'https://example.com/space');
    });
});

test('write invalid scope URL to .blinkmrc.json', (t) => {
  const cwd = t.context.tempDir;
  return lib.write({ cwd, scope: 'abc' })
    .then(() => {
      t.fail();
    })
    .catch((err) => {
      t.ok(err);
      return Promise.resolve();
    });
});

test.serial('write to .blinkmrc.json in same directory', (t) => {
  const cwd = t.context.tempDir;
  return lib.write({ cwd, scope: 'https://example.com/space' })
    .then(() => lib.read({ cwd }))
    .then((scope) => {
      t.is(scope, 'https://example.com/space');
    });
});

test.serial('update to .blinkmrc.json in parent directory', (t) => {
  const cwd = path.join(t.context.tempDir, 'test');
  return lib.write({ cwd: t.context.tempDir, scope: 'https://example.com/space' })
    .then(() => lib.write({ cwd, scope: 'https://example.com/abcdef' }))
    .then(() => lib.read({ cwd: t.context.tempDir }))
    .then((scope) => {
      t.is(scope, 'https://example.com/abcdef');
    });
});
