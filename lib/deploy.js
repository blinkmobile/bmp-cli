'use strict';

// Node.js built-ins

const fs = require('fs');
const path = require('path');

// foreign modules

const async = require('async');
const pify = require('pify');
const readJsonFiles = require('@blinkmobile/json-as-files').readData;

// local modules

const api = require('./api');
const progress = require('./progress');
const resource = require('./resource');

// this module

const fsp = pify(fs);
const asyncp = pify(async);

function deployAnswerSpace (options) {
  return readJsonFiles({ filePath: path.join(options.cwd, 'answerSpace.json') })
    .then((data) => resource.fixAnswerSpace(data))
    .then((data) => api.putResource({ id: data.id, type: 'answerspaces', data }));
}

function deployInteraction (options) {
  const filePath = path.join(options.cwd, 'interactions', options.entry, `${options.entry}.json`);
  return readJsonFiles({ filePath })
    .then((data) => resource.fixInteraction(data))
    .then((data) => api.putResource({ id: data.id, type: 'interactions', data }));
}

function deployInteractions (options) {
  const cwd = options.cwd;
  return fsp.readdir(path.join(cwd, 'interactions'))
    .catch((err) => {
      if (err.code === 'ENOENT') {
        // it's not an error condition if we don't have any interactions
        return [];
      }
      throw err;
    })
    .then((entries) => {
      progress.addWork(entries.length);
      return entries;
    })
    .then((entries) => asyncp.eachSeries(entries, async.asyncify((entry) => {
      return deployInteraction({ cwd, entry })
        .then(() => progress.completeWork(1));
    })));
}

function deployAll () {
  const cwd = process.env.BMP_WORKING_DIR || process.cwd();

  return Promise.all([
    deployAnswerSpace({ cwd }),
    deployInteractions({ cwd })
  ]);
}

module.exports = {
  deployAll
};
