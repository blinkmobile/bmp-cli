'use strict';

const ORIGIN = 'https://example.com';

module.exports = (options, cb) => {
  switch (options.url) {
    case `${ORIGIN}/_api/v2/answerspaces/space`:
      cb(null, { statusCode: 200 }, `{
          "answerspaces": {
            "id": "123",
            "links": {
              "interactions": [ "456" ]
            },
            "name": "space"
          }
        }`);
      break;

    case `${ORIGIN}/_api/v2/answerspaces/space/interactions/456`:
      cb(null, { statusCode: 200 }, `{
        "interactions": {
          "id": "456",
          "name": "test"
        }
      }`);
      break;

    default:
      cb(new Error(`unexpected fetch: ${JSON.stringify(options)}`));
  }
};
