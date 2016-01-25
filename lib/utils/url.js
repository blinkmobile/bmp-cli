'use strict';

// Node.js built-ins

const url = require('url');

// this module

function isURL (string) {
  try {
    let result = url.parse(string);
    return !!(result.protocol && result.host);
  } catch (err) {
    return false;
  }
}

function getOrigin (string) {
  try {
    let result = url.parse(string);
    let host = result.host || `${result.hostname}:${result.port}`;
    return `${result.protocol}//${host}`;
  } catch (err) {
    return '';
  }
}

function toHTTPS (string) {
  let result = url.parse(string);
  result.protocol = 'https:';
  return url.format(result);
}

module.exports = {
  getOrigin,
  isURL,
  toHTTPS
};