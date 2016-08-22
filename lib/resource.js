'use strict';

/**
this module provides functions for reading and writing local files,
as well as functions for preparing data that is about to be written
*/

// Node.js built-ins

const path = require('path');

// foreign modules

const findReferences = require('@blinkmobile/json-as-files').findReferences;
const pify = require('pify');
const globp = pify(require('glob'));
const loadJson = require('load-json-file');
const memoize = require('lodash.memoize');
const readJsonFiles = require('@blinkmobile/json-as-files').readData;
const rimrafp = pify(require('rimraf'));
const writeJson = require('write-json-file');
const writeJsonFiles = require('@blinkmobile/json-as-files').writeData;

// local modules

const asyncp = require('./utils/asyncp');
const content = require('./content.js');

// this module

function deleteInteraction (options) {
  return rimrafp(path.join(options.cwd, 'interactions', options.name));
}

function listInteractions (options) {
  const cwd = options.cwd;
  return globp('*/*.json', {
    cwd: path.join(cwd, 'interactions')
  })
    .then((files) => {
      return files
        // keep just the results that match NAME/NAME.json pattern
        .filter((x) => /^([^\\\s]+)\/\1\.json$/.test(x))
        // then just give us the names
        .map((x) => x.split('/')[0]);
    })
    .then((names) => asyncp.mapSeries(names, asyncp.asyncify((name) => {
      return readInteraction({ cwd, name, raw: true })
        .then((data) => ({ id: data.id, name: data.name }));
    })));
}

/* mutates tree, applies `path.normalize()` for cross-platform support */
function normalizeTreePaths (tree) {
  tree.answerSpace.refs
    .forEach((ref) => {
      ref.target = path.normalize(ref.target);
    });
  Object.keys(tree.interactions).forEach((name) => {
    tree.interactions[name].refs
      .forEach((ref) => {
        ref.target = path.normalize(ref.target);
      });
  });
  return tree;
}

function readAnswerSpace (options) {
  const readFn = options.raw ? (options) => loadJson(options.filePath) : readJsonFiles;
  return readFn({ filePath: path.join(options.cwd, 'answerSpace.json') })
    .then((data) => content.fixAnswerSpace(data));
}

const readCachedAnswerSpace = memoize(readAnswerSpace);

function readInteraction (options) {
  const readFn = options.raw ? (options) => loadJson(options.filePath) : readJsonFiles;
  const filePath = path.join(options.cwd, 'interactions', options.name, `${options.name}.json`);
  return readFn({ filePath })
    .then((data) => content.fixInteraction(data));
}

// create a tree structure that describes local resources and their files references
function readLocalTree (options) {  // options: { cwd }
  const result = {
    answerSpace: { },
    interactions: {}
  };

  return readAnswerSpace({ cwd: options.cwd, raw: true })
    .then(findReferences)
    .then((refs) => {
      result.answerSpace.refs = [
        { path: [], target: 'answerSpace.json', type: '$file' }
      ]
        .concat(refs)
        .filter((ref) => ref.type === '$file');
    })
    .then(() => listInteractions({ cwd: options.cwd }))
    // change [ { id, name }, ... ] into [ "name", ... ]
    .then((interactions) => interactions.map((interaction) => interaction.name))
    .then((names) => Promise.all(names.map((name) => {
      return readInteraction({ cwd: options.cwd, name, raw: true })
        .then(findReferences)
        .then((refs) => {
          result.interactions[name] = {};
          result.interactions[name].refs = [
            { path: [], target: `${name}.json`, type: '$file' }
          ]
            .concat(refs)
            .filter((ref) => ref.type === '$file')
            // add the CWD-relative path to all interaction file references
            .map((ref) => ({
              path: ref.path,
              target: path.join('interactions', name, ref.target),
              type: ref.type
            }));
        });
    })))
    .then(() => normalizeTreePaths(result));
}

function writeAnswerSpace (options) {
  const filePath = path.join(options.cwd, 'answerSpace.json');
  const defaultPlaceholders = content.defaultAnswerSpace('answerSpace');

  return writeMergedPlaceholders(filePath, defaultPlaceholders)
    .then(() => {
      const data = Object.assign({}, options.data);
      content.fixAnswerSpace(data);
      // persist the real data, honoring the $file placeholders
      return writeJsonFiles({ data, filePath });
    });
}

function writeInteraction (options) {
  const cwd = options.cwd;
  const name = options.name;
  const filePath = path.join(cwd, 'interactions', name, `${name}.json`);
  const defaultPlaceholders = content.defaultInteraction(name);

  return writeMergedPlaceholders(filePath, defaultPlaceholders)
    .then(() => {
      const data = Object.assign({}, options.data);
      content.fixInteraction(data);
      // persist the real data, honoring the $file placeholders
      return writeJsonFiles({ data, filePath });
    });
}

function writeMergedPlaceholders (filePath, defaults) {
  return loadJson(filePath)
    .catch(() => ({})) // default to empty Object
    .then((existing) => content.mergePlaceholders(existing, defaults))
    .then((merged) => writeJson(filePath, merged));
}

module.exports = {
  deleteInteraction,
  listInteractions,
  normalizeTreePaths,
  readAnswerSpace,
  readCachedAnswerSpace,
  readInteraction,
  readLocalTree,
  writeAnswerSpace,
  writeInteraction
};
