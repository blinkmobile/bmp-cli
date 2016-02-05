'use strict';

function fixResource (data) {
  delete data.created_time;
  delete data.links;
  delete data.modified_time;
  return data;
}

function fixAnswerSpace (data) {
  fixResource(data);
  delete data.sitemap;
  return data;
}

function fixInteraction (data) {
  fixResource(data);
  if (typeof data.order !== 'number') {
    delete data.order;
  }
  return data;
}

module.exports = {
  fixAnswerSpace,
  fixInteraction
};
