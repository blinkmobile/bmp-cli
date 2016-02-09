'use strict';

function reverse (promise) {
  return new Promise((resolve, reject) => {
    promise
      .then(() => reject(new Error('resolved')))
      .catch(() => resolve());
  });
}

module.exports = {
  reverse
};
