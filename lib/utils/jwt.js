'use strict';

// foreign modules

const jwt = require('jsonwebtoken');

// this module

function isValidJWT (token) {
  try {
    return !!jwt.decode(token);
  } catch (err) {
    return false;
  }
}

module.exports = {
  isValidJWT
};
