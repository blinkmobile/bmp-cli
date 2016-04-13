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
const pull = require('../lib/pull');

// fixtures

const oneInteraction = require('./fixtures/request/one-interaction');
const oneInteractionFormerlyTwo = require('./fixtures/request/one-interaction-formerly-two');
const twoInteractions = require('./fixtures/request/two-interactions');

// this module

const fsp = pify(fs);
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
      process.env.BMP_WORKING_DIR = dirPath;
      t.context.tempDir = dirPath;
    })
    .then(() => {
      process.env.BMP_SCOPE = 'https://example.com/space';
      return auth.login({ credential: 'abcdef' });
    });
});

test.serial('pullAll', (t) => {
  reqFn = oneInteraction;
  return pull.pullAll()
    .then(() => fsp.access(path.join(t.context.tempDir, 'answerSpace.json')), fs.R_OK)
    .then(() => fsp.access(path.join(t.context.tempDir, 'interactions')), fs.R_OK | fs.X_OK)
    .then(() => fsp.access(path.join(t.context.tempDir, 'interactions', 'test')), fs.R_OK | fs.X_OK)
    .then(() => fsp.access(path.join(t.context.tempDir, 'interactions', 'test', 'test.json')), fs.R_OK);
});

test.serial('pullAll --prune', (t) => {
  reqFn = twoInteractions;
  return pull.pullAll()
    .then(() => fsp.readdir(path.join(t.context.tempDir, 'interactions')))
    .then((entries) => t.deepEqual(entries, ['def', 'ghi']))
    .then(() => {
      reqFn = oneInteractionFormerlyTwo;
    })
    .then(() => pull.pullAll({ prune: true }))
    .then(() => fsp.readdir(path.join(t.context.tempDir, 'interactions')))
    .then((entries) => t.deepEqual(entries, ['ghi']));
});

test.serial('pullAll with scope-content mismatch', (t) => {
  const fixturePath = path.join(__dirname, 'fixtures', 'deploy', 'mismatch');
  process.env.BMP_WORKING_DIR = fixturePath;
  process.env.BMP_SCOPE = ''; // rely on .blinkmrc.json file
  reqFn = (opts, cb) => { cb(new Error('unexpected fetch')); };
  t.throws(pull.pullAll(), /scope-content mismatch/);
});
