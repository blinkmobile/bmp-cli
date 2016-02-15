'use strict';

// local modules

const twoInteractions = require('./two-interactions');

// this module

const ORIGIN = 'https://example.com';

module.exports = (options, cb) => {
  switch (options.url) {
    case `${ORIGIN}/_api/v1/answerspaces/123`:
      cb(null, { statusCode: 200 }, `{
          "answerspaces": {
            "links": {
              "interactions": [ "789" ]
            }
          }
        }`);
      break;

    default:
      twoInteractions(options, cb);
  }
};
