'use strict';

/**
The functions in this module are functionally-pure functions,
for the purposes of manipulating the data contained within resources.
*/

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

module.exports = {
  defaultAnswerSpace,
  defaultInteraction,
  fixAnswerSpace,
  fixInteraction,
  mergePlaceholders,
  newInteraction
};
