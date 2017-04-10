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

const ERROR_ONLY_NO_MATCHES = 'ERROR_ONLY_NO_MATCHES';
function handleOnlyNoMatches (err) {
  if (err.message === ERROR_ONLY_NO_MATCHES) {
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

const ERROR_SCOPE_CONTENT_MISMATCH = 'ERROR_SCOPE_CONTENT_MISMATCH';
function handleScopeContentMismatch (err) {
  if (err.message === ERROR_SCOPE_CONTENT_MISMATCH) {
    const content = (err.data && `"${err.data.content}"`) || 'provided';
    const scope = (err.data && `"${err.data.scope}"`) || 'provided';
    const suggestedScope = (err.data && `"${err.data.suggestedScope}"`) || values.SCOPE_EXAMPLE;
    logger.error(`
Error: scope is ${scope},
but does not match the name ${content} in project JSON

This check is performed to avoid data-loss from accidentally pulling from or
deploying to the wrong project

Before proceeding, confirm that you are working on the expected project

To deploy, first set your scope to match, for example:
    bm bmp scope ${suggestedScope}

To pull, first edit the "name" in the project JSON to match
`);
    process.exit(1);
  }
}

const ERROR_SCOPE_INVALID = 'ERROR_SCOPE_INVALID';
function handleScopeInvalid (err) {
  // use err.data like Hapi.js does: https://github.com/hapijs/boom
  const data = `"${err.data}"` || 'provided scope';
  if (err.message === ERROR_SCOPE_INVALID) {
    logger.error(`
Error: ${data} is not a valid scope URL

Set your scope to a valid URL, for example:
    bm bmp scope ${values.SCOPE_EXAMPLE}
`);
    process.exit(1);
  }
}

const ERROR_SCOPE_NOT_SET = 'ERROR_SCOPE_NOT_SET';
function handleScopeNotSet (err) {
  if (err.message === ERROR_SCOPE_NOT_SET) {
    logger.error(`
Error: project scope is not set

Confirm that your current working directory is within your project directory

Set your scope if still necessary, for example:
    bm bmp scope ${values.SCOPE_EXAMPLE}
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
  ERROR_ONLY_NO_MATCHES,
  ERROR_SCOPE_CONTENT_MISMATCH,
  ERROR_SCOPE_INVALID,
  ERROR_SCOPE_NOT_SET,

  handle404,
  handleOnlyNoFiles,
  handleOnlyNoMatches,
  handleOnlyPrune,
  handleScopeContentMismatch,
  handleScopeInvalid,
  handleScopeNotSet,
  handleSitemap400
};
