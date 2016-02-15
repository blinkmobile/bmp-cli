'use strict';

// local modules

const create = require('../lib/create');

// this module

const INTERACTION = 'interaction';
const RESOURCE_TYPES = [ INTERACTION ];
const INTERACTION_MADL = 'madl';
const DEFAULT_INTERACTION_TYPE = INTERACTION_MADL;
const INTERACTION_TYPES = [ INTERACTION_MADL, 'message' ];

module.exports = function (input, flags, options) {
  const resourceType = input[0];
  const name = input[1];

  if (!~RESOURCE_TYPES.indexOf(resourceType)) {
    console.error(`provide a supported resource: ${RESOURCE_TYPES.join(', ')}`);
    process.exit(1);
  }

  let subType;

  if (resourceType === INTERACTION) {
    subType = flags.type || DEFAULT_INTERACTION_TYPE;
    if (!~INTERACTION_TYPES.indexOf(subType)) {
      console.error(`provide a supported "type": ${INTERACTION_TYPES.join(', ')}`);
      process.exit(1);
    }
  }

  if (!name) {
    console.error('mandatory "name" not provided');
    process.exit(1);
  }

  create.newInteraction({
    name,
    remote: flags.remote,
    type: subType
  });
};
