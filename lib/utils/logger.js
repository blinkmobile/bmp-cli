/* eslint-disable no-console */
'use strict';

// foreign modules

const chalk = require('chalk');

// this module

function colorMapper (color) {
  return function (value) {
    return chalk[color](value);
  };
}

function colorArgs (args, color) {
  return Array.prototype.slice.call(args)
    .map(colorMapper(color));
}

// use the "real" console at runtime to make mocking easier

function error () {
  return console.error.apply(console, colorArgs(arguments, 'red'));
}
function info () {
  return console.info.apply(console, arguments);
}
function log () {
  return console.log.apply(console, arguments);
}
function warn () {
  return console.warn.apply(console, colorArgs(arguments, 'yellow'));
}

module.exports = {
  error,
  info,
  log,
  warn
};
