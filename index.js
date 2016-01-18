'use strict';

// this module

module.exports = function () {
  global.console.log.apply(null, arguments);
};

module.exports.commands = {
  deploy: true,
  interaction: true,
  login: true,
  logout: true,
  pull: true,
  space: true,
  whoami: true
}
