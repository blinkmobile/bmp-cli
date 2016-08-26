/* @flow */
'use strict';

const test = require('ava');

const error = require('../lib/error.js');
const values = require('../lib/values.js');

const consoleError = console.error;
const consoleWarn = console.warn;
const noop = () => {};
const processExit = process.exit;
let exitFn = () => {};

test.beforeEach(() => {
  console.error = noop;
  console.warn = noop;
  process.exit = exitFn;
});

test.afterEach(() => {
  console.error = consoleError;
  console.warn = consoleWarn;
  process.exit = processExit;
});

const allHandlers = [
  'handle404',
  'handleOnlyNoFiles',
  'handleOnlyNoMatches',
  'handleOnlyPrune',
  'handleSitemap400'
];
allHandlers.forEach((name) => {
  test(`"${name}" is a function`, (t) => t.is(typeof error[name], 'function'));
});

test('"handle404" with a 404 error', (t) => {
  process.exit = (code) => t.is(code, 1);
  error.handle404(new Error('404'));
});

test('"handle404" with a different kind of error', (t) => {
  process.exit = (code) => t.fail('unexpected call');
  error.handle404(new Error('different kind of error'));
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

test(`"handleOnlyNoMatches" with a "${values.ERROR_ONLY_NO_MATCHES}" error`, (t) => {
  process.exit = (code) => t.is(code, 0);
  error.handleOnlyNoMatches(new Error(values.ERROR_ONLY_NO_MATCHES));
});

test('"handleOnlyNoMatches" with a different kind of error', (t) => {
  process.exit = (code) => t.fail('unexpected call');
  error.handleOnlyNoMatches(new Error('different kind of error'));
});

test('"handleSitemap400" with a 400 error', (t) => {
  t.notThrows(() => error.handleSitemap400(new Error('400')));
});

test('"handleSitemap400" with a different kind of error', (t) => {
  t.throws(() => error.handleSitemap400(new Error('different kind of error')));
});

