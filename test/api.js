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

test.serial('getAuthStatus 200 => CREDS_GOOD', (t) => {
  const ORIGIN = 'https://example.com';
  reqFn = (options, cb) => {
    t.is(options.method, 'GET');
    t.is(options.url, `${ORIGIN}/_api/v2/answerspaces/space`);
    cb(null, { statusCode: 200 }, '{ "answerspaces": { "name": "space" } }');
  };
  return api.getAuthStatus()
    .then((status) => t.is(status, api.CREDS_GOOD));
});

test.serial('getAuthStatus 401 => CREDS_BAD', (t) => {
  const ORIGIN = 'https://example.com';
  reqFn = (options, cb) => {
    t.is(options.method, 'GET');
    t.is(options.url, `${ORIGIN}/_api/v2/answerspaces/space`);
    cb(null, { statusCode: 401 }, '{}');
  };
  return api.getAuthStatus()
    .then((status) => t.is(status, api.CREDS_BAD));
});

test.serial('logout then getAuthStatus => CREDS_MISSING', (t) => {
  reqFn = (options, cb) => {
    cb(new Error('unexpected call'));
  };
  return auth.logout()
    .then(() => api.getAuthStatus())
    .then((status) => t.is(status, api.CREDS_MISSING));
});

test.serial('getResource', (t) => {
  const ORIGIN = 'https://example.com';
  reqFn = (options, cb) => {
    t.is(options.method, 'GET');
    t.is(options.url, `${ORIGIN}/_api/v2/answerspaces/space`);
    cb(null, { statusCode: 200 }, `{
      "answerspaces": {
        "id": "123",
        "name": "space"
      }
    }`);
  };
  return api.getResource({
    uid: 'space',
    type: 'answerspaces'
  });
});

test.serial('getResource with result mismatch', (t) => {
  const ORIGIN = 'https://example.com';
  reqFn = (options, cb) => {
    t.is(options.method, 'GET');
    t.is(options.url, `${ORIGIN}/_api/v2/answerspaces/space`);
    cb(null, { statusCode: 200 }, `{
      "answerspaces": {
        "id": "456",
        "name": "otherspace"
      }
    }`);
  };
  return t.throws(api.getResource({
    uid: 'space',
    type: 'answerspaces'
  }), /request-result mismatch/);
});

test.serial('putResource with id', (t) => {
  const ORIGIN = 'https://example.com';
  reqFn = (options, cb) => {
    t.is(options.method, 'PUT');
    t.is(options.url, `${ORIGIN}/_api/v2/answerspaces/space/interactions/123`);
    cb(null, { statusCode: 200 }, '{}');
  };
  return api.putResource({
    id: '123',
    data: { id: '123' },
    type: 'interactions',
    uid: 'space'
  });
});

test.serial('putResource without id', (t) => {
  const ORIGIN = 'https://example.com';
  reqFn = (options, cb) => {
    t.is(options.method, 'POST');
    t.is(options.url, `${ORIGIN}/_api/v2/answerspaces/space/interactions`);
    cb(null, { statusCode: 200 }, '{}');
  };
  return api.putResource({
    data: {},
    type: 'interactions',
    uid: 'space'
  });
});

test.serial('wipeSiteMap', (t) => {
  const ORIGIN = 'https://example.com';
  reqFn = (options, cb) => {
    t.is(options.method, 'PUT');
    t.is(options.url, `${ORIGIN}/_api/v2/answerspaces/space`);
    t.deepEqual(options.body, {
      answerspaces: { id: '123', name: 'space', sitemap: '' }
    });
    cb(null, { statusCode: 200 }, `{
      "answerspaces": {
        "id": "123",
        "name": "space"
      }
    }`);
  };
  return api.wipeSiteMap({
    id: '123',
    data: { id: '123', name: 'space', config: {} },
    uid: 'space',
    type: 'answerspaces'
  });
});
