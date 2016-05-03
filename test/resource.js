'use strict';

// Node.js built-ins

const fs = require('fs');
const path = require('path');

// foreign modules

const loadJson = require('load-json-file');
const pify = require('pify');
const temp = pify(require('temp').track());
const test = require('ava');
const writeJson = require('write-json-file');

// local modules

const pkg = require('../package.json');
const resource = require('../lib/resource');

// fixtures

const customRefs = require('./fixtures/resource/custom-refs.json');
const customRefsData = require('./fixtures/resource/custom-refs.data.json');

// this module

const fsp = pify(fs);

test.beforeEach((t) => {
  return temp.mkdir(pkg.name.replace(/\//g, '-') + '-')
    .then((dirPath) => {
      process.env.BMP_WORKING_DIR = dirPath;
      t.context.tempDir = dirPath;
    });
});

test('fixAnswerSpace', (t) => {
  const input = {
    created_time: '',
    modified_time: '',
    links: {},
    sitemap: ''
  };
  const output = resource.fixAnswerSpace(input);
  t.truthy(input === output, 'mutates input object');
  t.deepEqual(output, {});
});

test('fixInteraction', (t) => {
  const input = {
    created_time: '',
    modified_time: '',
    links: {},
    order: 1
  };
  const output = resource.fixInteraction(input);
  t.truthy(input === output, 'mutates input object');
  t.deepEqual(output, { order: 1 });
});

test('fixInteraction with null order', (t) => {
  const input = {
    created_time: '',
    modified_time: '',
    links: {},
    order: null
  };
  const output = resource.fixInteraction(input);
  t.truthy(input === output, 'mutates input object');
  t.deepEqual(output, {});
});

test.serial('writeInteraction with existing custom $file references', (t) => {
  const NAME = 'abc';
  return writeJson(path.join(t.context.tempDir, 'interactions', NAME, `${NAME}.json`), customRefs)
    .then(() => resource.writeInteraction({
      cwd: t.context.tempDir,
      data: customRefsData,
      name: NAME
    }))
    .then(() => loadJson(path.join(t.context.tempDir, 'interactions', NAME, `${NAME}.json`)))
    .then((data) => t.deepEqual(data.config.default.message, customRefs.config.default.message))
    .then(() => fsp.readFile(path.join(t.context.tempDir, 'interactions', NAME, `${NAME}.message.html`), 'utf8'))
    .then((message) => t.is(message, '<h1>abc</h1>'));
});
