'use strict';

const ORIGIN = 'https://example.com';

module.exports = (options, cb) => {
  switch (options.url) {
    case `${ORIGIN}/_api/v2/answerspaces/space`:
      cb(null, { statusCode: 200 }, '{ "answerspaces": { "name": "space" } }');
      break;

    default:
      cb(new Error(`unexpected fetch: ${JSON.stringify(options)}`));
  }
};
