'use strict';

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

module.exports = {
  defaultAnswerSpace,
  defaultInteraction,
  fixAnswerSpace,
  fixInteraction
};
