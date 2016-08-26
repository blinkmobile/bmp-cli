'use strict';

// foreign modules

const updateNotifier = require('update-notifier');

// local modules

const commands = {
  deploy: require('./commands/deploy'),
  create: require('./commands/create'),
  login: require('./commands/login'),
  logout: require('./commands/logout'),
  pull: require('./commands/pull'),
  scope: require('./commands/scope')
};

const pkg = require('./package.json');

// this module

updateNotifier({ pkg }).notify();

const help = `
  Usage: blinkm bmp <command>

  where <command> is one of:
    ${Object.keys(commands).join(', ')}

  Initial settings:
    scope           => outputs the current scope and login status
    scope [<url>]   => sets the current URL scope
    login           => store credentials on this machine
    logout          => remove credentials from this machine

  Getting work done:
    pull            => download remote configuration to local files
      --prune       => delete local files that are absent from remote
    deploy          => update remote configuration to match local project
      --prune       => delete remote interactions that are absent locally
      <file|glob>   => update remote configuration matching these files

  Creating new interactions:
    create interaction <name>
                    => creates a new hidden+active interaction locally
      --type=<type> => type can be "madl" (default), or "message"
      --remote      => also create a remote placeholder
`;

module.exports = function (input, flags) {
  const command = input[0];

  if (!command) {
    console.log(help);
    process.exit(0);
  }

  if (!commands[command]) {
    console.error(`unknown command: ${command}`);
    console.log(help);
    process.exit(1);
  }

  if (typeof commands[command] !== 'function') {
    console.log('not implemented');
    process.exit(1);
  }

  commands[command](input.slice(1), flags, { cwd: process.cwd() });
};

module.exports.commands = commands;

module.exports.help = help;
