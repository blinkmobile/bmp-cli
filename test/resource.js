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

test('matchTreePaths: no filePaths', (t) => {
  const fixturePath = path.join(__dirname, 'fixtures', 'resource', 'local-tree');
  return resource.readLocalTree({ cwd: fixturePath })
    .then((tree) => resource.matchTreePaths(tree, []))
    .then((tree) => {
      t.falsy(tree.answerSpace);
      t.is(Object.keys(tree.interactions).length, 0);
    });
});

test('matchTreePaths: answerSpace filePath', (t) => {
  const fixturePath = path.join(__dirname, 'fixtures', 'resource', 'local-tree');
  return resource.readLocalTree({ cwd: fixturePath })
    .then((tree) => resource.matchTreePaths(tree, [ 'answerSpace.json' ]))
    .then((tree) => {
      t.truthy(tree.answerSpace);
      t.is(Object.keys(tree.interactions).length, 0);
    });
});

test('matchTreePaths: answerSpace content filePath', (t) => {
  const fixturePath = path.join(__dirname, 'fixtures', 'resource', 'local-tree');
  return resource.readLocalTree({ cwd: fixturePath })
    .then((tree) => resource.matchTreePaths(tree, [ 'answerSpace.styleSheet.css' ]))
    .then((tree) => {
      t.truthy(tree.answerSpace);
      t.is(Object.keys(tree.interactions).length, 0);
    });
});

test('matchTreePaths: interaction filePath', (t) => {
  const fixturePath = path.join(__dirname, 'fixtures', 'resource', 'local-tree');
  return resource.readLocalTree({ cwd: fixturePath })
    .then((tree) => resource.matchTreePaths(tree, [ 'interactions/madl/madl.json' ]))
    .then((tree) => {
      t.falsy(tree.answerSpace);
      t.is(Object.keys(tree.interactions).length, 1);
      t.truthy(tree.interactions.madl);
    });
});

test('matchTreePaths: interaction content filePath', (t) => {
  const fixturePath = path.join(__dirname, 'fixtures', 'resource', 'local-tree');
  return resource.readLocalTree({ cwd: fixturePath })
    .then((tree) => resource.matchTreePaths(tree, [ 'interactions/madl/madl.madl.php' ]))
    .then((tree) => {
      t.falsy(tree.answerSpace);
      t.is(Object.keys(tree.interactions).length, 1);
      t.truthy(tree.interactions.madl);
    });
});

test('readLocalTree', (t) => {
  const fixturePath = path.join(__dirname, 'fixtures', 'resource', 'local-tree');
  const expected = resource.normalizeTreePaths(require(path.join(fixturePath, 'expected.json')));
  return resource.readLocalTree({ cwd: fixturePath })
    .then((result) => t.deepEqual(result, expected));
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
