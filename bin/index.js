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
    'prune',
    'remote'
  ],
  type: [ 'type' ]
});

main(cli.input, cli.flags);
