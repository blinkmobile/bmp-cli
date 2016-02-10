'use strict';

const ORIGIN = 'https://example.com';

module.exports = (options, cb) => {
  switch (options.url) {
    case `${ORIGIN}/_api/v1/answerspaces/123`:
      cb(null, { statusCode: 200 }, `{}`);
      break;

    default:
      cb(new Error('unexpected fetch'));
  }
};
