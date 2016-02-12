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
const readJsonFiles = require('@blinkmobile/json-as-files').readData;
const rimrafp = pify(require('rimraf'));
const writeJsonFiles = require('@blinkmobile/json-as-files').writeData;

// local modules

const asyncp = require('./utils/asyncp');

// this module

function defaultResource (base) {
  return {
    config: {
      all: {},
      default: {
        footer: { $file: `${base}.footer.html` },
        header: { $file: `${base}.header.html` },
        styleSheet: { $file: `${base}.styleSheet.css` }
      }
    }
  };
}

function defaultAnswerSpace (base) {
  const obj = defaultResource(base);
  Object.assign(obj.config.all, {
    basicModeDisabledMessage: { $file: `${base}.basicModeDisabledMessage.html` }
  });
  Object.assign(obj.config.default, {
    htmlHead: { $file: `${base}.htmlHead.html` },
    introMessage: { $file: `${base}.introMessage.html` }
  });
  return obj;
}

function defaultInteraction (base) {
  const obj = defaultResource(base);
  Object.assign(obj.config.default, {
    inputPrompt: { $file: `${base}.inputPrompt.html` },
    madl: { $file: `${base}.madl.php` },
    message: { $file: `${base}.message.txt` },
    xsl: { $file: `${base}.xsl.xml` }
  });
  return obj;
}

function deleteInteraction (options) {
  return rimrafp(path.join(options.cwd, 'interactions', options.name));
}

function fixResource (data) {
  delete data.created_time;
  delete data.links;
  delete data.modified_time;
  return data;
}

function fixAnswerSpace (data) {
  fixResource(data);
  delete data.sitemap;
  return data;
}

function fixInteraction (data) {
  fixResource(data);
  if (typeof data.order !== 'number') {
    delete data.order;
  }
  return data;
}

/** mutates defaults, does not mutate existing */
function mergePlaceholders (existing, defaults) {
  [
    'all', 'default'
  ].forEach((section) => {
    const config = existing.config || {};
    config[section] = config[section] || {};
    Object.keys(config[section]).forEach((key) => {
      const value = config[section][key];
      if (value && typeof value === 'object' && value.$file) {
        defaults.config[section][key] = value;
      }
    });
  });
  return defaults;
}

function mergeExistingPlaceholders (filePath, defaults) {
  return loadJson(filePath)
    .catch(() => ({})) // default to empty Object
    .then((existing) => mergePlaceholders(existing, defaults));
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

function newInteraction (options) {
  const name = options.name;
  const data = {
    config: {
      all: {},
      default: {
        display: 'hide',
        displayName: name
      }
    },
    name
  };
  switch (options.type) {
    case 'madl':
      data.config.all.type = 'madl code';
      data.config.default.madl = '?><?php\n';
      break;

    case 'message':
      data.config.all.type = options.type;
      data.config.default.message = '\n';
      break;
  }
  return data;
}

function readAnswerSpace (options) {
  return readJsonFiles({ filePath: path.join(options.cwd, 'answerSpace.json') })
    .then((data) => fixAnswerSpace(data));
}

function readInteraction (options) {
  const filePath = path.join(options.cwd, 'interactions', options.name, `${options.name}.json`);
  return readJsonFiles({ filePath })
    .then((data) => fixInteraction(data));
}

function writeAnswerSpace (options) {
  const filePath = path.join(options.cwd, 'answerSpace.json');
  const defaultPlaceholders = defaultAnswerSpace('answerSpace');

  return mergeExistingPlaceholders(filePath, defaultPlaceholders)
    .then((template) => {
      const data = Object.assign({}, options.data);
      fixAnswerSpace(data);
      // persist the real data, honoring the $file placeholders
      return writeJsonFiles({ data, filePath, template });
    });
}

function writeInteraction (options) {
  const cwd = options.cwd;
  const name = options.name;
  const filePath = path.join(cwd, 'interactions', name, `${name}.json`);
  const defaultPlaceholders = defaultInteraction(name);

  return mergeExistingPlaceholders(filePath, defaultPlaceholders)
    .then((template) => {
      const data = Object.assign({}, options.data);
      fixInteraction(data);
      // persist the real data, honoring the $file placeholders
      return writeJsonFiles({ data, filePath, template });
    });
}

module.exports = {
  deleteInteraction,
  fixAnswerSpace,
  fixInteraction,
  listInteractions,
  newInteraction,
  readAnswerSpace,
  readInteraction,
  writeAnswerSpace,
  writeInteraction
};
