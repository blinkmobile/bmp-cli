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
            "id": "123",
            "links": {
              "interactions": [ "456" ]
            }
          }
        }`);
      break;

    case `${ORIGIN}/_api/v1/interactions/456`:
      cb(null, { statusCode: 200 }, `{
        "interactions": {
          "id": "456",
          "name": "test"
        }
      }`);
      break;

    default:
      cb(new Error('unexpected fetch'));
  }
};
