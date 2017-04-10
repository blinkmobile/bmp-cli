/* @flow */
'use strict';

// foreign modules

const test = require('ava');

// local modules

const error = require('../lib/error.js');

// this module

const noop = () => {};

const processExit = process.exit;

/* eslint-disable no-console */ // mocking console here for silence

let consoleError = console.error;
let consoleWarn = console.warn;

test.beforeEach(() => {
  console.error = noop;
  console.warn = noop;
  process.exit = noop;
});

test.afterEach(() => {
  console.error = consoleError;
  console.warn = consoleWarn;
  process.exit = processExit;
});

/* eslint-enable no-console */

// everything starting with "handle" is a function
Object.keys(error)
  .filter((name) => /^handle/.test(name))
  .forEach((name) => {
    test(`"${name}" is a function`, (t) => t.is(typeof error[name], 'function'));
  });

// all string constants are values in an enum(eration): enumerators
Object.keys(error)
  .filter((name) => !!(typeof error[name] === 'string'))
  .forEach((name) => {
    test(`value of "${name}" is "${name}"`, (t) => t.is(error[name], name));
  });

const exitOnMatch = [
  { name: 'handle404', msg: '404', exitCode: 1 },
  { name: 'handleOnlyNoMatches', msg: error.ERROR_ONLY_NO_MATCHES, exitCode: 0 },
  { name: 'handleScopeContentMismatch', msg: error.ERROR_SCOPE_CONTENT_MISMATCH, exitCode: 1 },
  { name: 'handleScopeInvalid', msg: error.ERROR_SCOPE_INVALID, exitCode: 1 },
  { name: 'handleScopeNotSet', msg: error.ERROR_SCOPE_NOT_SET, exitCode: 1 }
];
exitOnMatch.forEach((match) => {
  const name = match.name;
  const msg = match.msg;
  const exitCode = match.exitCode;
  test(`"${name}()" with "${msg}" calls process.exit(${exitCode})`, (t) => {
    process.exit = (code) => t.is(code, exitCode);
    error[name](new Error(msg));
  });

  test(`"${name}()" without "${msg}" does not call process.exit()`, (t) => {
    process.exit = (code) => t.fail('unexpected call');
    return t.notThrows(() => error[name](new Error('different kind of error')));
  });
});

// tests for error handlers that always call `process.exit(1);` (error)
const exitOne = [
  'handleOnlyNoFiles',
  'handleOnlyPrune'
];
exitOne.forEach((name) => {
  test(`"${name}" calls process.exit(1);`, (t) => {
    process.exit = (code) => t.is(code, 1);
    error[name](new Error('blah blah'));
  });
});

test('"handleSitemap400" with a 400 error', (t) => {
  t.notThrows(() => error.handleSitemap400(new Error('400')));
});

test('"handleSitemap400" with a different kind of error', (t) => {
  t.throws(() => error.handleSitemap400(new Error('different kind of error')));
});
