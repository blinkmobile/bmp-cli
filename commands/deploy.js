'use strict';

// foreign modules

const Gauge = require('gauge');

// local modules

const deploy = require('../lib/deploy');
const error = require('../lib/error');
const progress = require('../lib/progress');

// this module

module.exports = function (input, flags, options) {
  const gauge = new Gauge({ theme: 'colorASCII' });

  progress.on('change', (name, completed) => {
    gauge.pulse();
    gauge.show('deploy', completed);
  });

  return deploy.deployAll({ prune: !!flags.prune })
    .then(() => {
      progress.finish();
      gauge.hide();
    })
    .catch((err) => {
      gauge.hide();
      error.handle404(err);
      throw err;
    });
};
