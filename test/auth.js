'use strict';

// Node.js built-ins

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

test.beforeEach((t) => {
  return temp.mkdir(pkg.name.replace(/\//g, '-') + '-')
    .then((dirPath) => {
      t.context.tempDir = dirPath;
    });
});

test('login without setting scope first', (t) => {
  return auth.login({
    credential: 'abcdef',
    userConfigDir: t.context.tempDir
  })
    .catch((err) => { t.ok(err); });
});

test('login with scope', (t) => {
  const CONFIG_FILE = path.join(t.context.tempDir, 'blinkmrc.json');
  return auth.login({
    credential: 'abcdef',
    scope: 'https://example.com/space',
    userConfigDir: t.context.tempDir
  })
    .then(() => loadJson(CONFIG_FILE))
    .then((cfg) => {
      t.is(cfg.bmp['https://example.com'].credential, 'abcdef');
    });
});

test('logout without login first', (t) => {
  const CONFIG_FILE = path.join(t.context.tempDir, 'blinkmrc.json');
  return auth.logout({
    credential: 'abcdef',
    scope: 'https://example.com/space',
    userConfigDir: t.context.tempDir
  })
    .then(() => loadJson(CONFIG_FILE))
    .catch((err) => {
      t.ok(err);
    });
});

test('login then logout', (t) => {
  const CONFIG_FILE = path.join(t.context.tempDir, 'blinkmrc.json');
  const options = {
    credential: 'abcdef',
    scope: 'https://example.com/space',
    userConfigDir: t.context.tempDir
  };
  return auth.login(options)
    .then(() => auth.logout(options))
    .then(() => loadJson(CONFIG_FILE))
    .then((cfg) => {
      t.ok(!cfg.bmp['https://example.com'].credential);
    });
});
