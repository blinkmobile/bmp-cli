'use strict';

// foreign modules

const mockery = require('mockery');
const pify = require('pify');
const temp = pify(require('temp').track());
const test = require('ava');

// local modules

const auth = require('../lib/auth');
const pkg = require('../package.json');
const whoami = require('../lib/whoami');

// this module

let reqFn;

test.before(() => {
  mockery.enable();
  mockery.registerAllowables([ 'empower-core' ]);
  mockery.registerMock('request', (url, cb) => reqFn(url, cb));
});
test.after(() => mockery.disable());

test.beforeEach((t) => {
  return temp.mkdir(pkg.name.replace(/\//g, '-') + '-')
    .then((dirPath) => {
      process.env.BMP_USER_CONFIG_DIR = dirPath;
      process.env.BMP_WORKING_DIR = dirPath;
      t.context.tempDir = dirPath;
    })
    .then(() => {
      process.env.BMP_SCOPE = 'https://example.com/space';
      return auth.login({ credential: 'abcdef' });
    });
});

test.serial('lookupUser, 200', (t) => {
  const ORIGIN = 'https://example.com';
  reqFn = (url, cb) => {
    t.is(url, `${ORIGIN}/_api/v1/dashboard`);
    cb(null, { statusCode: 200 }, '{}');
  };
  return whoami.lookupUser();
});

test.serial('lookupUser for HTTP scope, 200', (t) => {
  process.env.BMP_SCOPE = 'http://example.com/space';
  reqFn = (url, cb) => {
    t.is(url, `https://example.com/_api/v1/dashboard`);
    cb(null, { statusCode: 200 }, '{}');
  };
  return whoami.lookupUser();
});

test.serial('lookupUser, error', (t) => {
  const ORIGIN = 'https://example.com';
  reqFn = (url, cb) => {
    t.is(url, `${ORIGIN}/_api/v1/dashboard`);
    cb(new Error('blah'));
  };
  return whoami.lookupUser()
    .catch((err) => {
      t.is(err.message, 'blah');
    });
});

test.serial('lookupUser, 403', (t) => {
  const ORIGIN = 'https://example.com';
  reqFn = (url, cb) => {
    t.is(url, `${ORIGIN}/_api/v1/dashboard`);
    cb(null, { statusCode: 403 });
  };
  return whoami.lookupUser()
    .catch((err) => {
      t.is(err.message, '403');
    });
});
