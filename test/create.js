'use strict';

// Node.js built-ins

const path = require('path');

// foreign modules

const loadJson = require('load-json-file');
const mockery = require('mockery');
const pify = require('pify');
const temp = pify(require('temp').track());
const test = require('ava');
const writeJson = require('write-json-file');

// local modules

const auth = require('../lib/auth');
const create = require('../lib/create');
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
      process.env.BMP_WORKING_DIR = dirPath;
      t.context.tempDir = dirPath;
    })
    .then(() => {
      process.env.BMP_SCOPE = 'https://example.com/space';
      return auth.login({ credential: 'abcdef' });
    });
});

test.serial('newInteraction madl', (t) => {
  const NAME = 'test';
  return create.newInteraction({ name: NAME, type: 'madl' })
    .then(() => loadJson(path.join(t.context.tempDir, 'interactions', NAME, `${NAME}.json`)))
    .then((data) => {
      t.falsy(data.id);
      t.is(data.name, NAME);
      t.is(data.config.all.type, 'madl code');
      t.is(data.config.default.display, 'hide');
    });
});

test.serial('newInteraction message', (t) => {
  const NAME = 'test';
  return create.newInteraction({ name: NAME, type: 'message' })
    .then(() => loadJson(path.join(t.context.tempDir, 'interactions', NAME, `${NAME}.json`)))
    .then((data) => {
      t.falsy(data.id);
      t.is(data.name, NAME);
      t.is(data.config.all.type, 'message');
      t.is(data.config.default.display, 'hide');
    });
});

test.serial('newInteraction madl remote', (t) => {
  const NAME = 'test';
  const ORIGIN = 'https://example.com';

  let isSubmitted = false;
  reqFn = (options, cb) => {
    isSubmitted = true;
    switch (options.url) {
      case `${ORIGIN}/_api/v1/interactions`:
        t.falsy(options.body.interactions.id);
        t.is(options.body.interactions.links.answerspaces, '123');
        cb(null, { statusCode: 201 }, JSON.stringify({
          interactions: { id: '456', name: NAME }
        }));
        break;

      default:
        cb(new Error('unexpected fetch'));
    }
  };
  return writeJson(path.join(t.context.tempDir, 'answerSpace.json'), {
    id: '123'
  })
    .then(() => create.newInteraction({ name: NAME, remote: true, type: 'madl' }))
    .then(() => loadJson(path.join(t.context.tempDir, 'interactions', NAME, `${NAME}.json`)))
    .then((data) => {
      t.truthy(isSubmitted);
      t.is(data.id, '456');
      t.is(data.name, NAME);
    });
});
