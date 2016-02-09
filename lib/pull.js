'use strict';

// Node.js built-ins

const path = require('path');

// foreign modules

const async = require('async');
const pify = require('pify');
const mkdirp = require('mkdirp');

// local modules

const api = require('./api');
const progress = require('./progress');
const resource = require('./resource');
const values = require('./values');

// this module

const asyncp = pify(async);
const mkdirpp = pify(mkdirp);

function pullAnswerSpace (options) {
  let interactions;
  return api.getDashboard()
    .then((obj) => obj.answerSpace.id)
    .then((id) => api.getResource({ id, type: 'answerspaces' }))
    .then((result) => {
      interactions = result.answerspaces.links.interactions || [];
      return resource.writeAnswerSpace({
        cwd: options.cwd,
        data: result.answerspaces
      });
    })
    .then(() => interactions);
}

function pullInteraction (options) {
  return api.getResource({ id: options.id, type: 'interactions' })
    .then((result) => resource.writeInteraction({
      cwd: options.cwd,
      data: result.interactions,
      name: result.interactions.name
    }));
}

function pullInteractions (options) {
  const cwd = options.cwd;
  const interactions = options.interactions;

  progress.addWork(interactions.length);
  return mkdirpp(path.join(cwd, 'interactions'))
    .then(() => asyncp.eachLimit(interactions, values.MAX_REQUESTS, async.asyncify((id) => {
      return pullInteraction({ cwd, id })
        .then(() => progress.completeWork(1));
    })));
}

function pullAll () {
  const cwd = process.env.BMP_WORKING_DIR || process.cwd();

  return pullAnswerSpace({ cwd })
    .then((interactions) => pullInteractions({ cwd, interactions }));
}

module.exports = {
  pullAll
};
