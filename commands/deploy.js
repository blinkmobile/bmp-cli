'use strict';

// foreign modules

const Gauge = require('gauge');

// local modules

const deploy = require('../lib/deploy');
const progress = require('../lib/progress');

// this module

module.exports = function (input, flags, options) {
  const gauge = new Gauge();

  progress.on('change', (name, completed) => gauge.show('deploy', completed));

  return deploy.deployAll()
    .then(() => {
      progress.finish();
      gauge.hide();
    })
    .catch((err) => {
      gauge.hide();
      throw err;
    });
};
