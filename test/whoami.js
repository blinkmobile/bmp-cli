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

test('getAuthentication', (t) => {
  return whoami.getAuthentication({
    scope: 'https://example.com/space',
    userConfigDir: t.context.tempDir
  })
    .then((auth) => {
      t.same(auth, { origin: 'https://example.com', credential: 'abcdef' });
    });
});

test('getAuthentication, no blinkmrc.json file', (t) => {
  return fsp.unlink(path.join(t.context.tempDir, 'blinkmrc.json'))
    .then(() => whoami.getAuthentication({
      scope: 'https://example.com/space',
      userConfigDir: t.context.tempDir
    }))
    .catch((err) => t.ok(err));
});

test('getAuthentication, corrupt blinkmrc.json file', (t) => {
  return fsp.appendFile(path.join(t.context.tempDir, 'blinkmrc.json'), 'abc')
    .then(() => whoami.getAuthentication({
      scope: 'https://example.com/space',
      userConfigDir: t.context.tempDir
    }))
    .catch((err) => t.ok(err));
});

test('getAuthentication, after logging out', (t) => {
  const options = {
    scope: 'https://example.com/space',
    userConfigDir: t.context.tempDir
  };
  return auth.logout(options)
    .then(() => whoami.getAuthentication(options))
    .then(() => t.fail('resolved'))
    .catch((err) => t.ok(err));
});

test('getAuthentications', (t) => {
  return whoami.getAuthentications({ userConfigDir: t.context.tempDir })
    .then((auths) => {
      t.same(auths, [
        { origin: 'https://example.com', credential: 'abcdef' },
        { origin: 'https://otherexample.com', credential: 'ghijkl' }
      ]);
    });
});

test('lookupUser, 200', (t) => {
  const ORIGIN = 'https://example.com';
  reqFn = (url, cb) => {
    t.is(url, `${ORIGIN}/_api/v1/dashboard`);
    cb(null, { statusCode: 200 }, '{}');
  };
  return whoami.lookupUser({
    auth: { origin: ORIGIN, credential: 'abcdef' },
    reqFn
  });
});

test('lookupUser for HTTP scope, 200', (t) => {
  const ORIGIN = 'http://example.com';
  reqFn = (url, cb) => {
    t.is(url, `https://example.com/_api/v1/dashboard`);
    cb(null, { statusCode: 200 }, '{}');
  };
  return whoami.lookupUser({
    auth: { origin: ORIGIN, credential: 'abcdef' },
    reqFn
  });
});

test('lookupUser, error', (t) => {
  const ORIGIN = 'https://example.com';
  reqFn = (url, cb) => {
    t.is(url, `${ORIGIN}/_api/v1/dashboard`);
    cb(new Error('blah'));
  };
  return whoami.lookupUser({
    auth: { origin: ORIGIN, credential: 'abcdef' },
    reqFn
  })
    .catch((err) => {
      t.is(err.message, 'blah');
    });
});

test('lookupUser, 403', (t) => {
  const ORIGIN = 'https://example.com';
  reqFn = (url, cb) => {
    t.is(url, `${ORIGIN}/_api/v1/dashboard`);
    cb(null, { statusCode: 403 });
  };
  return whoami.lookupUser({
    auth: { origin: ORIGIN, credential: 'abcdef' },
    reqFn
  })
    .catch((err) => {
      t.is(err.message, '403');
    });
});
