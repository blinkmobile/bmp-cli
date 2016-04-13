'use strict';

// Node.js built-ins

const path = require('path');

// foreign modules

const mkdirp = require('mkdirp');
const mockery = require('mockery');
const pify = require('pify');
const temp = pify(require('temp').track());
const test = require('ava');
const writeJson = require('write-json-file');

// local modules

const auth = require('../lib/auth');
const deploy = require('../lib/deploy');
const pkg = require('../package.json');

// fixtures

const oneInteraction = require('./fixtures/request/one-interaction');
const noInteractions = require('./fixtures/request/no-interactions');
const twoInteractions = require('./fixtures/request/two-interactions');

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
      process.env.BMP_WORKING_DIR = dirPath;
      t.context.tempDir = dirPath;
    })
    .then(() => {
      process.env.BMP_SCOPE = 'https://example.com/space';
      return auth.login({ credential: 'abcdef' });
    });
});

test.serial('deployAll', (t) => {
  reqFn = oneInteraction;
  return writeJson(path.join(t.context.tempDir, 'answerSpace.json'), {
    id: '123'
  })
    .then(() => mkdirp(path.join(t.context.tempDir, 'interactions', 'test')))
    .then(() => writeJson(path.join(t.context.tempDir, 'interactions', 'test', 'test.json'), {
      id: '456',
      name: 'test'
    }))
    .then(() => deploy.deployAll());
});

test.serial('deployAll no interactions', (t) => {
  reqFn = noInteractions;
  return writeJson(path.join(t.context.tempDir, 'answerSpace.json'), { id: '123' })
    .then(() => deploy.deployAll());
});

test.serial('deployAll --prune', (t) => {
  reqFn = (options, cb) => {
    const ORIGIN = 'https://example.com';
    switch (options.url) {
      case `${ORIGIN}/_api/v1/interactions/789`:
        t.is(options.method, 'DELETE');
        cb(null, { statusCode: 204 }, '{}');
        break;

      default:
        t.truthy(~['GET', 'PUT'].indexOf(options.method));
        return twoInteractions(options, cb);
    }
  };
  return writeJson(path.join(t.context.tempDir, 'answerSpace.json'), {
    id: '123'
  })
    .then(() => mkdirp(path.join(t.context.tempDir, 'interactions', 'def')))
    .then(() => writeJson(path.join(t.context.tempDir, 'interactions', 'def', 'def.json'), {
      id: '456',
      name: 'def'
    }))
    .then(() => deploy.deployAll({ prune: true }));
});

test.serial('deployAll with .DS_Store files', (t) => {
  const tempDir = t.context.tempDir;
  reqFn = oneInteraction;
  return Promise.all([
    writeJson(path.join(tempDir, 'answerSpace.json'), {
      id: '123'
    }),
    writeJson(path.join(tempDir, 'interactions', 'test', 'test.json'), {
      id: '456',
      name: 'test'
    })
  ])
    .then(() => Promise.all([
      writeJson(path.join(tempDir, '.DS_Store'), {}),
      writeJson(path.join(tempDir, 'interactions', '.DS_Store'), {}),
      writeJson(path.join(tempDir, 'interactions', 'test', '.DS_Store'), {})
    ]))
    .then(() => deploy.deployAll());
});

test.serial('deployAll with scope-content mismatch', (t) => {
  const fixturePath = path.join(__dirname, 'fixtures', 'deploy', 'mismatch');
  process.env.BMP_WORKING_DIR = fixturePath;
  process.env.BMP_SCOPE = ''; // rely on .blinkmrc.json file
  reqFn = (opts, cb) => { cb(new Error('unexpected fetch')); };
  t.throws(deploy.deployAll(), /scope-content mismatch/);
});
