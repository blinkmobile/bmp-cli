'use strict';

// Node.js built-ins

const fs = require('fs');
const path = require('path');

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

const fsp = pify(fs);

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
    })
    .then(() => {
      process.env.BMP_SCOPE = 'https://otherexample.com/space';
      return auth.login({ credential: 'ghijkl' });
    });
});

test.serial('getAuthentication', (t) => {
  process.env.BMP_SCOPE = 'https://example.com/space';
  return whoami.getAuthentication()
    .then((auth) => {
      t.same(auth, { origin: 'https://example.com', credential: 'abcdef' });
    });
});

test.serial('getAuthentication, no blinkmrc.json file', (t) => {
  return fsp.unlink(path.join(t.context.tempDir, 'blinkmrc.json'))
    .then(() => whoami.getAuthentication({
      scope: 'https://example.com/space',
      userConfigDir: t.context.tempDir
    }))
    .catch((err) => t.ok(err));
});

test.serial('getAuthentication, corrupt blinkmrc.json file', (t) => {
  return fsp.appendFile(path.join(t.context.tempDir, 'blinkmrc.json'), 'abc')
    .then(() => whoami.getAuthentication({
      scope: 'https://example.com/space',
      userConfigDir: t.context.tempDir
    }))
    .catch((err) => t.ok(err));
});

test.serial('getAuthentication, after logging out', (t) => {
  process.env.BMP_SCOPE = 'https://example.com/space';
  return auth.logout()
    .then(() => whoami.getAuthentication())
    .then(() => t.fail('resolved'))
    .catch((err) => t.ok(err));
});

test.serial('getAuthentications', (t) => {
  return whoami.getAuthentications({})
    .then((auths) => {
      t.same(auths, [
        { origin: 'https://example.com', credential: 'abcdef' },
        { origin: 'https://otherexample.com', credential: 'ghijkl' }
      ]);
    });
});

test.serial('lookupUser, 200', (t) => {
  const ORIGIN = 'https://example.com';
  reqFn = (url, cb) => {
    t.is(url, `${ORIGIN}/_api/v1/dashboard`);
    cb(null, { statusCode: 200 }, '{}');
  };
  return whoami.lookupUser({
    auth: { origin: ORIGIN, credential: 'abcdef' }
  });
});

test.serial('lookupUser for HTTP scope, 200', (t) => {
  const ORIGIN = 'http://example.com';
  reqFn = (url, cb) => {
    t.is(url, `https://example.com/_api/v1/dashboard`);
    cb(null, { statusCode: 200 }, '{}');
  };
  return whoami.lookupUser({
    auth: { origin: ORIGIN, credential: 'abcdef' }
  });
});

test.serial('lookupUser, error', (t) => {
  const ORIGIN = 'https://example.com';
  reqFn = (url, cb) => {
    t.is(url, `${ORIGIN}/_api/v1/dashboard`);
    cb(new Error('blah'));
  };
  return whoami.lookupUser({
    auth: { origin: ORIGIN, credential: 'abcdef' }
  })
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
  return whoami.lookupUser({
    auth: { origin: ORIGIN, credential: 'abcdef' }
  })
    .catch((err) => {
      t.is(err.message, '403');
    });
});
