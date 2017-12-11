#!/usr/bin/env node
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
  flags: {
    only: {type: 'boolean', default: false},
    prune: {type: 'boolean', default: false},
    remote: {type: 'boolean', default: false},
    type: {type: 'string', default: 'madl'}
  }
});

main(cli.input, cli.flags)
  .catch((err) => {
    error.handle404(err);
    error.handleOnlyNoMatches(err);
    error.handleScopeContentMismatch(err);
    error.handleScopeInvalid(err);
    error.handleScopeNotSet(err);

    logger.error(err);
    process.exit(1);
  });
