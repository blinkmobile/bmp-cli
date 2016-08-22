'use strict';

// Node.js built-ins

const fs = require('fs');
const path = require('path');

// foreign modules

const mkdirp = require('mkdirp');
const pify = require('pify');

// local modules

const content = require('./content.js');
const deploy = require('./deploy');
const resource = require('./resource');
const promise = require('./utils/promise');

// this module

const fsp = pify(fs);
const mkdirpp = pify(mkdirp);

function assertUniqueInteractionName (options) {
  const interactionPath = options.interactionPath;
  const name = options.name;
  return promise.reverse(fsp.access(interactionPath, fs.F_OK))
    .catch(() => {
      throw new Error(`interaction "${name}" already exists`);
    });
}

function newInteraction (options) {
  const cwd = process.env.BMP_WORKING_DIR || process.cwd();
  const name = options.name;
  const interactionPath = path.join(cwd, 'interactions', name);
  const type = options.type;

  return assertUniqueInteractionName({ interactionPath, name })
    .then(() => mkdirpp(interactionPath))
    // follow mostly the same process as in pull
    .then(() => resource.writeInteraction({
      cwd,
      data: content.newInteraction({ name, type }),
      name
    }))
    .then(() => {
      if (options.remote) {
        return deploy.deployInteraction({ cwd, name })
          .then(() => deploy.wipeSiteMap({ cwd }));
      }
    });
}

module.exports = {
  newInteraction
};
