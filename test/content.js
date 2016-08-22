'use strict';

// foreign modules

const test = require('ava');

// local modules

const content = require('../lib/content.js');

// this module

test('fixAnswerSpace', (t) => {
  const input = {
    created_time: '',
    modified_time: '',
    links: {},
    sitemap: ''
  };
  const output = content.fixAnswerSpace(input);
  t.truthy(input === output, 'mutates input object');
  t.deepEqual(output, {});
});

test('fixInteraction', (t) => {
  const input = {
    created_time: '',
    modified_time: '',
    links: {},
    order: 1
  };
  const output = content.fixInteraction(input);
  t.truthy(input === output, 'mutates input object');
  t.deepEqual(output, { order: 1 });
});

test('fixInteraction with null order', (t) => {
  const input = {
    created_time: '',
    modified_time: '',
    links: {},
    order: null
  };
  const output = content.fixInteraction(input);
  t.truthy(input === output, 'mutates input object');
  t.deepEqual(output, {});
});
