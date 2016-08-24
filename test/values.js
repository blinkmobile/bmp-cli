/* @flow */
'use strict';

const test = require('ava');

const values = require('../lib/values.js');

Object.keys(values).forEach((name) => {
  test(`"${name}" is truthy`, (t) => t.truthy(values[name]));
});

const enumerators = [
  'ERROR_ONLY_NO_MATCHES',
  'ERROR_SCOPE_NOT_SET'
];
enumerators.forEach((name) => {
  test(`value of "${name}" is "${name}"`, (t) => t.is(values[name], name));
});
