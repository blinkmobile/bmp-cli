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

test.serial('pullAnswerSpace', (t) => {
  const ORIGIN = 'https://example.com';
  reqFn = (options, cb) => {
    switch (options.url) {
      case `${ORIGIN}/_api/v1/dashboard`:
        cb(null, { statusCode: 200 }, '{ "answerSpace": { "id": "123" } }');
        break;

      case `${ORIGIN}/_api/v1/answerspaces/123`:
        cb(null, { statusCode: 200 }, `{
            "answerspaces": {
              "links": {
                "interactions": [ "456" ]
              }
            }
          }`);
        break;

      case `${ORIGIN}/_api/v1/interactions/456`:
        cb(null, { statusCode: 200 }, `{ "interactions": { "name": "test" } }`);
        break;

      default:
        cb(new Error('unexpected fetch'));
    }
  };
  return pull.pullAnswerSpace()
    .then(() => fsp.access(path.join(t.context.tempDir, 'answerSpace.json')), fs.R_OK)
    .then(() => fsp.access(path.join(t.context.tempDir, 'interactions')), fs.R_OK | fs.X_OK)
    .then(() => fsp.access(path.join(t.context.tempDir, 'interactions', 'test')), fs.R_OK | fs.X_OK)
    .then(() => fsp.access(path.join(t.context.tempDir, 'interactions', 'test', 'test.json')), fs.R_OK);
});
