/* @flow */
'use strict';

const test = require('ava');

const values = require('../lib/values.js');

Object.keys(values).forEach((name) => {
  test(`"${name}" is truthy`, (t) => t.truthy(values[name]));
});
