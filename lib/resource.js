'use strict';

/**
this module provides functions for reading and writing local files,
as well as functions for preparing data that is about to be written
*/

// Node.js built-ins

const path = require('path');

// foreign modules

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
      return readInteraction({ cwd, name })
        .then((data) => ({ id: data.id, name: data.name }));
    })));
}

function readAnswerSpace (options) {
  return readJsonFiles({ filePath: path.join(options.cwd, 'answerSpace.json') })
    .then((data) => fixAnswerSpace(data));
}

const readCachedAnswerSpace = memoize(readAnswerSpace);

function readInteraction (options) {
  const filePath = path.join(options.cwd, 'interactions', options.name, `${options.name}.json`);
  return readJsonFiles({ filePath })
    .then((data) => fixInteraction(data));
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
  readAnswerSpace,
  readCachedAnswerSpace,
  readInteraction,
  writeAnswerSpace,
  writeInteraction
};
