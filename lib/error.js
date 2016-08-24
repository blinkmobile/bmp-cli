'use strict';

// local modules

const logger = require('./utils/logger.js');
const values = require('./values.js');

// this module

function handle404 (err) {
  if (err.message === '404') {
    logger.error(`
Error: 404
- the remote project you are managing no longer exists; or
- your scope points to a BMP service that is too old

To install the older CLI tool (compatible with older BMP services):
    npm install -g @blinkmobile/cli @blinkmobile/bmp-cli@'<'1
`);
    process.exit(1);
  }
}

function handleOnlyNoFiles () {
  logger.error(`
Error: no files specified for use with --only
`);
  process.exit(1);
}

function handleOnlyNoMatches (err) {
  if (err.message === values.ERROR_ONLY_NO_MATCHES) {
    logger.warn(`
Warning: no actions to perform

Files specified with --only did not match any resources
`);
    process.exit(0);
  }
}

function handleOnlyPrune () {
  logger.error(`
Error: --prune cannot be used with --only
`);
  process.exit(1);
}

function handleScopeNotSet (err) {
  if (err.message === values.ERROR_SCOPE_NOT_SET) {
    logger.error(`
Error: project scope is not set

Confirm that your current working directory is within your project directory

Set your scope if still necessary, for example:
    bm bmp scope https://service.domain/project
`);
    process.exit(1);
  }
}

function handleSitemap400 (err) {
  if (err.message === '400') {
    logger.warn(`
Warning: unable to automatically refresh sitemap

If you recently changed security settings or created new interactions
then you MUST view them in the /admin CMS to apply changes

This will not be necessary with a future BMP service update
`);
    return;
  }
  throw err;
}

module.exports = {
  handle404,
  handleOnlyNoFiles,
  handleOnlyNoMatches,
  handleOnlyPrune,
  handleScopeNotSet,
  handleSitemap400
};
