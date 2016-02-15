'use strict';

const ORIGIN = 'https://example.com';

module.exports = (options, cb) => {
  switch (options.url) {
    case `${ORIGIN}/_api/v1/dashboard`:
      cb(null, { statusCode: 200 }, '{ "answerSpace": { "id": "123" } }');
      break;

    case `${ORIGIN}/_api/v1/answerspaces/123`:
      cb(null, { statusCode: 200 }, `{
          "answerspaces": {
            "links": {
              "interactions": [ "456", "789" ]
            }
          }
        }`);
      break;

    case `${ORIGIN}/_api/v1/interactions/456`:
      cb(null, { statusCode: 200 }, `{ "interactions": { "name": "def" } }`);
      break;

    case `${ORIGIN}/_api/v1/interactions/789`:
      cb(null, { statusCode: 200 }, `{ "interactions": { "name": "ghi" } }`);
      break;

    default:
      cb(new Error('unexpected fetch'));
  }
};
