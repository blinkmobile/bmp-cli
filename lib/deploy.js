'use strict';

// Node.js built-ins

const fs = require('fs');
const path = require('path');

// foreign modules

const memoize = require('lodash.memoize');
const pify = require('pify');

// local modules

const api = require('./api');
const asyncp = require('./utils/asyncp');
const progress = require('./progress');
const resource = require('./resource');
const values = require('./values');

// this module

const fsp = pify(fs);

const readCachedAnswerSpace = memoize(resource.readAnswerSpace);

function deployAnswerSpace (options) {
  return readCachedAnswerSpace(options)
    .then((data) => api.putResource({ id: data.id, type: 'answerspaces', data }));
}

function deployInteraction (options) {
  let isNew;
  return Promise.all([
    readCachedAnswerSpace({ cwd: options.cwd }),
    resource.readInteraction(options)
  ])
    .then((results) => {
      const answerSpace = results[0];
      const data = results[1];
      isNew = !data.id;
      data.links = { answerspaces: answerSpace.id };
      return api.putResource({ id: data.id, type: 'interactions', data });
    })
    .then((result) => {
      if (isNew) {
        return resource.writeInteraction({
          cwd: options.cwd,
          data: result.interactions,
          name: result.interactions.name
        });
      }
    });
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
    .then((names) => asyncp.eachLimit(names, values.MAX_REQUESTS, asyncp.asyncify((name) => {
      return deployInteraction({ cwd, name })
        .then(() => progress.completeWork(1));
    })));
}

function deployAll (options) {
  options = options || {};
  const cwd = process.env.BMP_WORKING_DIR || process.cwd();

  return Promise.all([
    deployAnswerSpace({ cwd }),
    deployInteractions({ cwd })
  ])
    .then(() => {
      if (options.prune) {
        return pruneInteractions({ cwd });
      }
    });
}

function pruneInteractions (options) {
  return api.getDashboard()
    .then((obj) => obj.answerSpace.id)
    .then((id) => Promise.all([
      api.getResource({ id, type: 'answerspaces' }),
      resource.listInteractions({ cwd: options.cwd })
    ]))
    .then((results) => {
      const remoteIds = results[0].answerspaces.links.interactions || [];
      const localIds = results[1].map((i) => i.id);
      const pruneIds = remoteIds.filter((id) => localIds.indexOf('' + id) === -1);
      progress.addWork(pruneIds.length);
      return pruneIds;
    })
    .then((pruneIds) => asyncp.eachLimit(pruneIds, values.MAX_REQUESTS, asyncp.asyncify((id) => {
      return api.deleteResource({ id, type: 'interactions' })
        .then(() => progress.completeWork(1));
    })));
}

module.exports = {
  deployAll,
  deployInteraction
};
