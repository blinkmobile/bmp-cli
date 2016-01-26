'use strict';

// Node.js built-ins

const os = require('os');
const path = require('path');

// foreign modules

const AppDirectory = require('appdirectory');

// local modules

const pkg = require('../package.json');

// this module

const CONFIG_FILE = '.blinkmrc.json';

// use ~/.config in OS X (like Linux), dotfiles are better for CLIs
const platform = (() => {
  const p = os.platform();
  if (p === 'darwin') {
    return 'linux';
  }
  return p;
})();

const dirs = new AppDirectory({
  appName: pkg.name,
  platform,
  useRoaming: false
});

const USER_CONFIG_DIR = dirs.userConfig();

function userConfigFile (userConfigDir) {
  return path.join(userConfigDir || dirs.userConfig(), 'blinkmrc.json');
}

module.exports = {
  CONFIG_FILE,
  USER_CONFIG_DIR,
  userConfigFile
};
