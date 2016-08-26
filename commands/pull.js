'use strict';

// foreign modules

const Gauge = require('gauge');

// local modules

const progress = require('../lib/progress');
const pull = require('../lib/pull');

// this module

module.exports = function (input, flags, options) {
  const gauge = new Gauge({ theme: 'colorASCII' });

  progress.on('change', (name, completed) => {
    gauge.pulse();
    gauge.show('pull', completed);
  });

  return pull.pullAll({ prune: !!flags.prune })
    .then(() => {
      progress.finish();
      gauge.hide();
    })
    .catch((err) => {
      gauge.hide();
      throw err;
    });
};
