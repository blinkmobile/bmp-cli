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

function defaultConfig (base) {
  return {
    config: {
      all: {},
      default: {
        footer: { $file: `${base}.footer.html` },
        header: { $file: `${base}.header.html` },
        styleSheet: { $file: `${base}.styleSheet.css` }
      }
    }
  };
}

function defaultAnswerSpaceConfig (base) {
  const obj = defaultConfig(base);
  Object.assign(obj.config.all, {
    basicModeDisabledMessage: { $file: `${base}.basicModeDisabledMessage.html` }
  });
  Object.assign(obj.config.default, {
    htmlHead: { $file: `${base}.htmlHead.html` },
    introMessage: { $file: `${base}.introMessage.html` }
  });
  return obj;
}

function defaultInteractionConfig (base) {
  const obj = defaultConfig(base);
  Object.assign(obj.config.default, {
    inputPrompt: { $file: `${base}.inputPrompt.html` },
    madl: { $file: `${base}.madl.php` },
    message: { $file: `${base}.message.txt` },
    xsl: { $file: `${base}.xsl.xml` }
  });
  return obj;
}

const MAX_REQUESTS = 5;

module.exports = {
  CONFIG_FILE,
  MAX_REQUESTS,
  defaultAnswerSpaceConfig,
  defaultConfig,
  defaultInteractionConfig
};

Object.defineProperty(module.exports, 'USER_CONFIG_DIR', {
  enumerable: true,
  get () {
    return process.env.BMP_USER_CONFIG_DIR || USER_CONFIG_DIR;
  }
});

Object.defineProperty(module.exports, 'USER_CONFIG_FILE', {
  enumerable: true,
  get () {
    const dirPath = process.env.BMP_USER_CONFIG_DIR || USER_CONFIG_DIR;
    return path.join(dirPath, 'blinkmrc.json');
  }
});
