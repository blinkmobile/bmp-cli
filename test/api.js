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
  mockery.registerMock('request', (url, cb) => reqFn(url, cb));
});
test.after(() => mockery.disable());

test.beforeEach((t) => {
  return temp.mkdir(pkg.name.replace(/\//g, '-') + '-')
    .then((dirPath) => {
      t.context.tempDir = dirPath;
    })
    .then(() => {
      return auth.login({
        credential: 'abcdef',
        scope: 'https://example.com/space',
        userConfigDir: t.context.tempDir
      });
    })
    .then(() => {
      return auth.login({
        credential: 'ghijkl',
        scope: 'https://otherexample.com/space',
        userConfigDir: t.context.tempDir
      });
    });
});

test.serial('getDashboard', (t) => {
  const ORIGIN = 'https://example.com';
  reqFn = (url, cb) => {
    t.is(url, `${ORIGIN}/_api/v1/dashboard`);
    cb(null, { statusCode: 200 }, '{}');
  };
  return api.getDashboard({
    auth: { origin: ORIGIN, credential: 'abcdef' }
  });
});

test.serial('getResource', (t) => {
  const ORIGIN = 'https://example.com';
  reqFn = (url, cb) => {
    t.is(url, `${ORIGIN}/_api/v1/answerspaces/123`);
    cb(null, { statusCode: 200 }, '{}');
  };
  return api.getResource({
    auth: { origin: ORIGIN, credential: 'abcdef' },
    id: 123,
    type: 'answerspaces'
  });
});
