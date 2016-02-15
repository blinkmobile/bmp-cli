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

const madlPhp = require('./fixtures/resource/madl-php.json');
const madlPhpData = require('./fixtures/resource/madl-php.data.json');

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
  t.ok(input === output, 'mutates input object');
  t.same(output, {});
});

test('fixInteraction', (t) => {
  const input = {
    created_time: '',
    modified_time: '',
    links: {},
    order: 1
  };
  const output = resource.fixInteraction(input);
  t.ok(input === output, 'mutates input object');
  t.same(output, { order: 1 });
});

test('fixInteraction with null order', (t) => {
  const input = {
    created_time: '',
    modified_time: '',
    links: {},
    order: null
  };
  const output = resource.fixInteraction(input);
  t.ok(input === output, 'mutates input object');
  t.same(output, {});
});

test.serial('writeInteraction with existing custom $file references', (t) => {
  const NAME = customRefsData.name;
  return writeJson(path.join(t.context.tempDir, 'interactions', NAME, `${NAME}.json`), customRefs)
    .then(() => resource.writeInteraction({
      cwd: t.context.tempDir,
      data: customRefsData,
      name: NAME
    }))
    .then(() => loadJson(path.join(t.context.tempDir, 'interactions', NAME, `${NAME}.json`)))
    .then((data) => t.same(data.config.default.message, customRefs.config.default.message))
    .then(() => fsp.readFile(path.join(t.context.tempDir, 'interactions', NAME, `${NAME}.message.html`), 'utf8'))
    .then((code) => t.is(code, customRefsData.config.default.message));
});

test.serial('writeInteraction multiple times with PHP open tags', (t) => {
  const NAME = madlPhpData.name;
  const performWrite = () => resource.writeInteraction({
    cwd: t.context.tempDir,
    data: madlPhpData,
    name: NAME
  });
  return performWrite()
    .then(() => performWrite())
    .then(() => performWrite())
    .then(() => loadJson(path.join(t.context.tempDir, 'interactions', NAME, `${NAME}.json`)))
    .then((data) => t.same(data.config.default.madl, madlPhp.config.default.madl))
    .then(() => fsp.readFile(path.join(t.context.tempDir, 'interactions', NAME, `${NAME}.madl.php`), 'utf8'))
    .then((code) => t.is(code, madlPhpData.config.default.madl));
});
