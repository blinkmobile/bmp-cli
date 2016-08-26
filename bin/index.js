#! /usr/bin/env node
'use strict';

// foreign modules

const meow = require('meow');

// local modules

const main = require('..');

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

main(cli.input, cli.flags);
