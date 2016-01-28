'use strict';

// Node.js built-ins

const path = require('path');

// foreign modules

const pify = require('pify');
const mkdirp = pify(require('mkdirp'));
const writeJson = require('write-json-file');
const writeJsonFiles = require('@blinkmobile/json-as-files').writeData;

// local modules

const api = require('./api');
const values = require('./values');

// this module

function pullAnswerSpace (options) {
  options = options || {};
  const auth = options.auth || {};
  const cwd = process.env.BMP_WORKING_DIR || process.cwd();

  let interactions;
  // persist the default template with $file placeholders
  return writeJson(path.join(cwd, 'answerSpace.json'), values.defaultAnswerSpaceConfig('answerSpace'))
    .then(() => api.getDashboard(options))
    .then((obj) => obj.answerSpace.id)
    .then((id) => api.getResource({ auth, id, type: 'answerspaces' }))
    .then((obj) => {
      const data = Object.assign({}, obj.answerspaces);
      interactions = data.links.interactions || [];
      delete data.links;
      delete data.sitemap;
      // persist the real data, honoring the $file placeholders
      return writeJsonFiles({
        filePath: path.join(cwd, 'answerSpace.json'),
        data
      });
    })
    .then(() => mkdirp(path.join(cwd, 'interactions'))
    .then(() => Promise.all(interactions.map((id) => {
      let name;
      let obj;
      return api.getResource({ auth, id, type: 'interactions' })
        .then((result) => {
          obj = result.interactions;
          name = obj.name;

          // persist the default template with $file placeholders
          return writeJson(path.join(cwd, 'interactions', name, `${name}.json`), values.defaultInteractionConfig(name));
        })
        .then(() => {
          const data = Object.assign({}, obj);
          delete data.links;
          // persist the real data, honoring the $file placeholders
          return writeJsonFiles({
            filePath: path.join(cwd, 'interactions', data.name, `${data.name}.json`),
            data
          });
        });
    }))));
}

module.exports = {
  pullAnswerSpace
};
