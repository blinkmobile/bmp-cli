'use strict';

// Node.js built-ins

const fs = require('fs');
const path = require('path');

// foreign modules

const async = require('async');
const pify = require('pify');

// local modules

const api = require('./api');
const progress = require('./progress');
const resource = require('./resource');
const values = require('./values');

// this module

const fsp = pify(fs);
const asyncp = pify(async);

function deployAnswerSpace (options) {
  return resource.readAnswerSpace(options)
    .then((data) => api.putResource({ id: data.id, type: 'answerspaces', data }));
}

function deployInteraction (options) {
  return resource.readInteraction(options)
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
    .then((names) => {
      progress.addWork(names.length);
      return names;
    })
    .then((names) => asyncp.eachLimit(names, values.MAX_REQUESTS, async.asyncify((name) => {
      return deployInteraction({ cwd, name })
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
