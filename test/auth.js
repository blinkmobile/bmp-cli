'use strict';

// Node.js built-ins

const fs = require('fs');
const path = require('path');

// foreign modules

const loadJson = require('load-json-file');
const pify = require('pify');
const temp = pify(require('temp').track());
const test = require('ava');

// local modules

const auth = require('../lib/auth');
const pkg = require('../package.json');

// this module

const fsp = pify(fs);

test.beforeEach((t) => {
  process.env.BMP_SCOPE = 'https://example.com/space';
  return temp.mkdir(pkg.name.replace(/\//g, '-') + '-')
    .then((dirPath) => {
      process.env.BMP_USER_CONFIG_DIR = dirPath;
      t.context.tempDir = dirPath;
    });
});

test.serial('login without setting scope first', (t) => {
  process.env.BMP_SCOPE = null;
  return auth.login({
    credential: 'abcdef'
  })
    .catch((err) => { t.ok(err); });
});

test.serial('login with scope', (t) => {
  const CONFIG_FILE = path.join(t.context.tempDir, 'blinkmrc.json');
  return auth.login({
    credential: 'abcdef'
  })
    .then(() => loadJson(CONFIG_FILE))
    .then((cfg) => {
      t.is(cfg.bmp['https://example.com'].credential, 'abcdef');
    });
});

test.serial('logout without login first', (t) => {
  const CONFIG_FILE = path.join(t.context.tempDir, 'blinkmrc.json');
  return auth.logout({
    credential: 'abcdef'
  })
    .then(() => loadJson(CONFIG_FILE))
    .catch((err) => {
      t.ok(err);
    });
});

test.serial('login then logout', (t) => {
  const CONFIG_FILE = path.join(t.context.tempDir, 'blinkmrc.json');
  return auth.login({
    credential: 'abcdef'
  })
    .then(() => auth.logout())
    .then(() => loadJson(CONFIG_FILE))
    .then((cfg) => {
      t.ok(!cfg.bmp['https://example.com'].credential);
    });
});

test.serial('read, after login', (t) => {
  return auth.login({ credential: 'abcdef' })
    .then(() => auth.read())
    .then((a) => t.same(a, { origin: 'https://example.com', credential: 'abcdef' }));
});

test.serial('read, after login and logout', (t) => {
  return auth.login({ credential: 'abcdef' })
    .then(() => auth.logout())
    .then(() => auth.read())
    .then(() => t.fail('resolved'))
    .catch((err) => t.ok(err));
});

test.serial('read, no blinkmrc.json file', (t) => {
  return fsp.unlink(path.join(t.context.tempDir, 'blinkmrc.json'))
    .then(() => auth.read({
      scope: 'https://example.com/space',
      userConfigDir: t.context.tempDir
    }))
    .catch((err) => t.ok(err));
});

test.serial('read, corrupt blinkmrc.json file', (t) => {
  return fsp.appendFile(path.join(t.context.tempDir, 'blinkmrc.json'), 'abc')
    .then(() => auth.read({
      scope: 'https://example.com/space',
      userConfigDir: t.context.tempDir
    }))
    .catch((err) => t.ok(err));
});

test.serial('readAll', (t) => {
  process.env.BMP_SCOPE = 'https://example.com/space';
  return auth.login({ credential: 'abcdef' })
    .then(() => {
      process.env.BMP_SCOPE = 'https://otherexample.com/space';
      return auth.login({ credential: 'ghijkl' });
    })
    .then(() => auth.readAll())
    .then((auths) => {
      t.same(auths, [
        { origin: 'https://example.com', credential: 'abcdef' },
        { origin: 'https://otherexample.com', credential: 'ghijkl' }
      ]);
    });
});
