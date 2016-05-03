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
      process.env.BMP_USER_CONFIG_DIR = dirPath;
      process.env.BMP_WORKING_DIR = dirPath;
      t.context.tempDir = dirPath;
    });
});

test.serial('read missing .blinkmrc.json', (t) => {
  return lib.read()
    .then((result) => {
      t.fail();
    })
    .catch((err) => {
      t.truthy(err);
    });
});

test.serial('read empty .blinkmrc.json', (t) => {
  process.env.BMP_WORKING_DIR = path.join(__dirname, 'fixtures', 'scope', 'empty');
  return lib.read()
    .then(() => {
      t.fail();
    })
    .catch((err) => {
      t.truthy(err);
    });
});

test.serial('read .blinkmrc.json in same directory', (t) => {
  process.env.BMP_WORKING_DIR = path.join(__dirname, 'fixtures', 'scope');
  return lib.read()
    .then((scope) => {
      t.is(scope, 'https://example.com/space');
    });
});

test.serial('read .blinkmrc.json in parent directory', (t) => {
  process.env.BMP_WORKING_DIR = path.join(__dirname, 'fixtures', 'scope', 'sub');
  return lib.read()
    .then((scope) => {
      t.is(scope, 'https://example.com/space');
    });
});

test.serial('write invalid scope URL to .blinkmrc.json', (t) => {
  return lib.write({ scope: 'abc' })
    .then(() => {
      t.fail();
    })
    .catch((err) => {
      t.truthy(err);
    });
});

test.serial('write to .blinkmrc.json in same directory', (t) => {
  return lib.write({ scope: 'https://example.com/space' })
    .then(() => lib.read())
    .then((scope) => {
      t.is(scope, 'https://example.com/space');
    });
});

test.serial('update to .blinkmrc.json in parent directory', (t) => {
  // write from parent directory
  process.env.BMP_WORKING_DIR = t.context.tempDir;
  return lib.write({ scope: 'https://example.com/space' })
    .then(() => {
      // write from sub-directory
      process.env.BMP_WORKING_DIR = path.join(t.context.tempDir, 'test');
      return lib.write({ scope: 'https://example.com/abcdef' });
    })
    // read from sub-directory
    .then(() => lib.read())
    .then((scope) => t.is(scope, 'https://example.com/abcdef'))
    // read from parent directory
    .then(() => {
      process.env.BMP_WORKING_DIR = t.context.tempDir;
      return lib.read();
    })
    .then((scope) => t.is(scope, 'https://example.com/abcdef'));
});
