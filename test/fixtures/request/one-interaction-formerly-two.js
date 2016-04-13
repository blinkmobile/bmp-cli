'use strict';

// local modules

const twoInteractions = require('./two-interactions');

// this module

const ORIGIN = 'https://example.com';

module.exports = (options, cb) => {
  switch (options.url) {
    case `${ORIGIN}/_api/v2/answerspaces/space`:
      cb(null, { statusCode: 200 }, `{
          "answerspaces": {
            "id": "123",
            "links": {
              "interactions": [ "789" ]
            },
            "name": "space"
          }
        }`);
      break;

    default:
      twoInteractions(options, cb);
  }
};
