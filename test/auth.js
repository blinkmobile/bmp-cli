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
      process.env.BMP_USER_CONFIG_DIR = dirPath;
      t.context.tempDir = dirPath;
    });
});

test.serial('login without setting scope first', (t) => {
  return auth.login({
    credential: 'abcdef'
  })
    .catch((err) => { t.ok(err); });
});

test.serial('login with scope', (t) => {
  const CONFIG_FILE = path.join(t.context.tempDir, 'blinkmrc.json');
  return auth.login({
    credential: 'abcdef',
    scope: 'https://example.com/space'
  })
    .then(() => loadJson(CONFIG_FILE))
    .then((cfg) => {
      t.is(cfg.bmp['https://example.com'].credential, 'abcdef');
    });
});

test.serial('logout without login first', (t) => {
  const CONFIG_FILE = path.join(t.context.tempDir, 'blinkmrc.json');
  return auth.logout({
    credential: 'abcdef',
    scope: 'https://example.com/space'
  })
    .then(() => loadJson(CONFIG_FILE))
    .catch((err) => {
      t.ok(err);
    });
});

test.serial('login then logout', (t) => {
  const CONFIG_FILE = path.join(t.context.tempDir, 'blinkmrc.json');
  const options = {
    credential: 'abcdef',
    scope: 'https://example.com/space'
  };
  return auth.login(options)
    .then(() => auth.logout(options))
    .then(() => loadJson(CONFIG_FILE))
    .then((cfg) => {
      t.ok(!cfg.bmp['https://example.com'].credential);
    });
});
