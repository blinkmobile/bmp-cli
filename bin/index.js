#!/usr/bin/env node
'use strict';

// foreign modules

const meow = require('meow');

// local modules

const main = require('..');

// this module

const cli = meow({
  help: `
    Usage: blinkm-bmp <command>

    where <command> is one of:
      ${Object.keys(main.commands).join(', ')}
  `,
  version: true
}, {});

main(cli.input, cli.flags);
