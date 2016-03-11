'use strict';

// foreign modules

const mockery = require('mockery');
const pify = require('pify');
const temp = pify(require('temp').track());
const test = require('ava');

// local modules

const api = require('../lib/api');
const auth = require('../lib/auth');
const pkg = require('../package.json');

// this module

let reqFn;

test.before(() => {
  mockery.enable();
  mockery.registerAllowables([ 'empower-core' ]);
  mockery.registerMock('request', (options, cb) => reqFn(options, cb));
});
test.after(() => mockery.disable());

test.beforeEach((t) => {
  return temp.mkdir(pkg.name.replace(/\//g, '-') + '-')
    .then((dirPath) => {
      process.env.BMP_USER_CONFIG_DIR = dirPath;
      t.context.tempDir = dirPath;
    })
    .then(() => {
      process.env.BMP_SCOPE = 'https://example.com/space';
      return auth.login({ credential: 'abcdef' });
    });
});

test.serial('getDashboard', (t) => {
  const ORIGIN = 'https://example.com';
  reqFn = (options, cb) => {
    t.is(options.method, 'GET');
    t.is(options.url, `${ORIGIN}/_api/v1/dashboard`);
    cb(null, { statusCode: 200 }, '{}');
  };
  return api.getDashboard();
});

test.serial('getResource', (t) => {
  const ORIGIN = 'https://example.com';
  reqFn = (options, cb) => {
    t.is(options.method, 'GET');
    t.is(options.url, `${ORIGIN}/_api/v1/answerspaces/123`);
    cb(null, { statusCode: 200 }, '{"answerspaces":{"id":"123"}}');
  };
  return api.getResource({
    id: '123',
    type: 'answerspaces'
  });
});

test.serial('getResource with result mismatch', (t) => {
  const ORIGIN = 'https://example.com';
  reqFn = (options, cb) => {
    t.is(options.method, 'GET');
    t.is(options.url, `${ORIGIN}/_api/v1/answerspaces/123`);
    cb(null, { statusCode: 200 }, '{"answerspaces":{"id":"456"}}');
  };
  t.throws(api.getResource({
    id: '123',
    type: 'answerspaces'
  }), /request-result mismatch/);
});

test.serial('putResource with id', (t) => {
  const ORIGIN = 'https://example.com';
  reqFn = (options, cb) => {
    t.is(options.method, 'PUT');
    t.is(options.url, `${ORIGIN}/_api/v1/interactions/123`);
    cb(null, { statusCode: 200 }, '{}');
  };
  return api.putResource({
    id: '123',
    data: { id: '123' },
    type: 'interactions'
  });
});

test.serial('putResource without id', (t) => {
  const ORIGIN = 'https://example.com';
  reqFn = (options, cb) => {
    t.is(options.method, 'POST');
    t.is(options.url, `${ORIGIN}/_api/v1/interactions`);
    cb(null, { statusCode: 200 }, '{}');
  };
  return api.putResource({
    data: {},
    type: 'interactions'
  });
});
