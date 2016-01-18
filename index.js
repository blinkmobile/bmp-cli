'use strict'

// foreign modules

const updateNotifier = require('update-notifier')

// local modules

const commands = {
  deploy: require('./commands/deploy'),
  interaction: require('./commands/interaction'),
  login: require('./commands/login'),
  logout: require('./commands/logout'),
  pull: require('./commands/pull'),
  scope: require('./commands/scope'),
  whoami: require('./commands/whoami')
}

const pkg = require('./package.json')

// this module

updateNotifier({ pkg }).notify()

const help = `
  Usage: blinkm-bmp <command>

  where <command> is one of:
    ${Object.keys(commands).join(', ')}
`

module.exports = function (input, flags) {
  const command = input[0]

  if (!command) {
    console.log(help)
    process.exit(0)
  }

  if (!commands[command]) {
    console.error(`unknown command: ${command}`)
    console.log(help)
    process.exit(1)
  }

  if (typeof commands[command] !== 'function') {
    console.log('not implemented')
    process.exit(1)
  }

  commands[command](input.slice(1), flags, { cwd: process.cwd() })
}

module.exports.commands = commands

module.exports.help = help
