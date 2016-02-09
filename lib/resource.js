'use strict';

// Node.js built-ins

const path = require('path');

// foreign modules

const readJsonFiles = require('@blinkmobile/json-as-files').readData;
const writeJson = require('write-json-file');
const writeJsonFiles = require('@blinkmobile/json-as-files').writeData;

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

  // persist the default template with $file placeholders
  return writeJson(filePath, defaultAnswerSpace('answerSpace'))
    .then(() => {
      const data = Object.assign({}, options.data);
      fixAnswerSpace(data);
      // persist the real data, honoring the $file placeholders
      return writeJsonFiles({ data, filePath });
    });
}

function writeInteraction (options) {
  const cwd = options.cwd;
  const name = options.name;
  const filePath = path.join(cwd, 'interactions', name, `${name}.json`);

  // persist the default template with $file placeholders
  return writeJson(filePath, defaultInteraction(name))
    .then(() => {
      const data = Object.assign({}, options.data);
      fixInteraction(data);
      // persist the real data, honoring the $file placeholders
      return writeJsonFiles({ data, filePath });
    });
}

module.exports = {
  defaultAnswerSpace,
  defaultInteraction,
  fixAnswerSpace,
  fixInteraction,
  newInteraction,
  readAnswerSpace,
  readInteraction,
  writeAnswerSpace,
  writeInteraction
};
