'use strict';

// foreign modules

const test = require('ava');

// local modules

const isValidJWT = require('../lib/utils/jwt.js').isValidJWT;

// this module

const COOKIE = 'COOKIE=value';
const JWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWV9.TJVA95OrM7E2cBab30RMHrHDcEfxjoYZgeFONFh7HgQ'; // https://jwt.io/

test(`"${COOKIE}" is not a valid JWT`, (t) => t.falsy(isValidJWT(COOKIE)));

test(`"${JWT}" is a valid JWT`, (t) => t.truthy(isValidJWT(JWT)));
