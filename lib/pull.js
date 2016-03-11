'use strict';

// Node.js built-ins

const path = require('path');

// foreign modules

const pify = require('pify');
const mkdirp = require('mkdirp');

// local modules

const api = require('./api');
const asyncp = require('./utils/asyncp');
const progress = require('./progress');
const resource = require('./resource');
const validate = require('./validate');
const values = require('./values');

// this module

const mkdirpp = pify(mkdirp);

function pruneInteractions (options) {
  const ids = options.interactions;
  return resource.listInteractions({ cwd: options.cwd })
    .then((interactions) => {
      return interactions.filter((interaction) => !~ids.indexOf(interaction.id));
    })
    .then((interactions) => asyncp.eachSeries(interactions, asyncp.asyncify((i) => {
      return resource.deleteInteraction({ cwd: options.cwd, name: i.name });
    })));
}

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
  // always force "id" to be a string
  return api.getResource({ id: '' + options.id, type: 'interactions' })
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
    .then(() => asyncp.eachLimit(interactions, values.MAX_REQUESTS, asyncp.asyncify((id) => {
      return pullInteraction({ cwd, id })
        .then(() => progress.completeWork(1));
    })));
}

function pullAll (options) {
  options = options || {};
  const cwd = process.env.BMP_WORKING_DIR || process.cwd();

  return validate.validateScopeMatchesContent({ cwd })
    .then(() => pullAnswerSpace({ cwd }))
    .then((interactions) => {
      if (options.prune) {
        return pruneInteractions({ cwd, interactions })
          .then(() => interactions);
      }
      return interactions;
    })
    .then((interactions) => pullInteractions({ cwd, interactions }));
}

module.exports = {
  pullAll
};
