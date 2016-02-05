'use strict';

// Node.js built-ins

const path = require('path');

// foreign modules

const async = require('async');
const pify = require('pify');
const mkdirp = require('mkdirp');
const writeJson = require('write-json-file');
const writeJsonFiles = require('@blinkmobile/json-as-files').writeData;

// local modules

const api = require('./api');
const resource = require('./resource');
const values = require('./values');

// this module

const asyncp = pify(async);
const mkdirpp = pify(mkdirp);

function pullAnswerSpace (options) {
  const cwd = options.cwd;

  let interactions;
  return writeJson(path.join(cwd, 'answerSpace.json'), values.defaultAnswerSpaceConfig('answerSpace'))
    .then(() => api.getDashboard())
    .then((obj) => obj.answerSpace.id)
    .then((id) => api.getResource({ id, type: 'answerspaces' }))
    .then((obj) => {
      const data = Object.assign({}, obj.answerspaces);
      interactions = data.links.interactions || [];
      resource.fixAnswerSpace(data);
      // persist the real data, honoring the $file placeholders
      return writeJsonFiles({
        filePath: path.join(cwd, 'answerSpace.json'),
        data
      });
    })
    .then(() => interactions);
}

function pullInteraction (options) {
  const cwd = options.cwd;

  let name;
  let obj;
  return api.getResource({ id: options.id, type: 'interactions' })
    .then((result) => {
      obj = result.interactions;
      name = obj.name;

      // persist the default template with $file placeholders
      return writeJson(path.join(cwd, 'interactions', name, `${name}.json`), values.defaultInteractionConfig(name));
    })
    .then(() => {
      const data = Object.assign({}, obj);
      resource.fixInteraction(data);
      // persist the real data, honoring the $file placeholders
      return writeJsonFiles({
        filePath: path.join(cwd, 'interactions', data.name, `${data.name}.json`),
        data
      });
    });
}

function pullInteractions (options) {
  const cwd = options.cwd;
  const interactions = options.interactions;

  return mkdirpp(path.join(cwd, 'interactions'))
    .then(() => asyncp.eachSeries(interactions, async.asyncify((id) => {
      return pullInteraction({ cwd, id });
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
