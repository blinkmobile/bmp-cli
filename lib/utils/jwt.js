'use strict';

// foreign modules

const jwt = require('jsonwebtoken');

// this module

function decode (token) {
  return jwt.decode(token);
}

function isValidJWT (token) {
  try {
    return !!decode(token);
  } catch (err) {
    return false;
  }
}

module.exports = {
  decode,
  isValidJWT
};
