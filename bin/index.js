#! /usr/bin/env node
'use strict';

// foreign modules

const meow = require('meow');

// local modules

const error = require('../lib/error.js');
const logger = require('../lib/utils/logger.js');
const main = require('../index.js');

// this module

const cli = meow({
  help: main.help,
  version: true
}, {
  boolean: [
    'only',
    'prune',
    'remote'
  ],
  defaults: {
    only: false,
    prune: false,
    remote: false
  },
  type: [ 'type' ]
});

main(cli.input, cli.flags)
  .catch((err) => {
    error.handle404(err);
    error.handleOnlyNoMatches(err);
    error.handleScopeInvalid(err);
    error.handleScopeNotSet(err);

    logger.error(err);
    process.exit(1);
  });
