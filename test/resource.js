'use strict';

// foreign modules

const test = require('ava');

// local modules

const resource = require('../lib/resource');

// this module

test('fixAnswerSpace', (t) => {
  const input = {
    created_time: '',
    modified_time: '',
    links: {},
    sitemap: ''
  };
  const output = resource.fixAnswerSpace(input);
  t.ok(input === output, 'mutates input object');
  t.same(output, {});
});

test('fixInteraction', (t) => {
  const input = {
    created_time: '',
    modified_time: '',
    links: {},
    order: 1
  };
  const output = resource.fixInteraction(input);
  t.ok(input === output, 'mutates input object');
  t.same(output, { order: 1 });
});

test('fixInteraction with null order', (t) => {
  const input = {
    created_time: '',
    modified_time: '',
    links: {},
    order: null
  };
  const output = resource.fixInteraction(input);
  t.ok(input === output, 'mutates input object');
  t.same(output, {});
});
