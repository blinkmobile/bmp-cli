'use strict';

// foreign modules

const argvAutoGlob = require('argv-auto-glob');
const Gauge = require('gauge');

// local modules

const deploy = require('../lib/deploy');
const error = require('../lib/error');
const progress = require('../lib/progress');

// this module

module.exports = function (input, flags, options) {
  const gauge = new Gauge({ theme: 'colorASCII' });

  input = argvAutoGlob(input);

  progress.on('change', (name, completed) => {
    gauge.pulse();
    gauge.show('deploy', completed);
  });

  let task;
  if (flags.only) {
    if (!input.length) {
      error.handleOnlyNoFiles();
    }
    if (flags.prune) {
      error.handleOnlyPrune();
    }
    task = deploy.deployOnly({ filePaths: input });
  } else {
    task = deploy.deployAll({ prune: flags.prune });
  }

  return task
    .then(() => {
      progress.finish();
      gauge.hide();
    })
    .catch((err) => {
      gauge.hide();
      error.handle404(err);
      error.handleOnlyNoMatches(err);
      throw err;
    });
};
