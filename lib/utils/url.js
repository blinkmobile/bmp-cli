'use strict';

// Node.js built-ins

const url = require('url');

// this module

function parse (string) {
  let result;
  if (/^\w+:\/\//.test(string)) {
    result = url.parse(string);
  } else if (~string.indexOf('//')) {
    result = url.parse(string, false, true);
  } else {
    result = url.parse('//' + string, false, true);
  }
  return result;
}

function isScopePath (string) {
  return string && typeof string === 'string' && /^\/?[^/]+$/.test(string);
}

function isScopeURL (string) {
  try {
    let result = parse(string);
    return !!(result.protocol && result.host && isScopePath(result.pathname));
  } catch (err) {
    return false;
  }
}

function isURL (string) {
  try {
    let result = parse(string);
    return !!(result.protocol && result.host);
  } catch (err) {
    return false;
  }
}

function getOrigin (string) {
  let result = url.parse(string);
  let host = result.host || `${result.hostname}:${result.port}`;
  return `${result.protocol}//${host}`;
}

function getPathSegment (string, index) {
  return url.parse(string).pathname.split('/')[index];
}

function toHTTPS (string) {
  try {
    let result = parse(string);
    result.protocol = 'https:';
    return url.format(result);
  } catch (err) {
    return string;
  }
}

module.exports = {
  getOrigin,
  getPathSegment,
  isScopeURL,
  isURL,
  toHTTPS
};
