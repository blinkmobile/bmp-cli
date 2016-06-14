'use strict';

function handle404 (err) {
  if (err.message === '404') {
    console.error(`
Error: 404
- the remote project you are managing no longer exists; or
- your scope points to a BMP service that is too old

To install the older CLI tool (compatible with older BMP services):
    npm install -g @blinkmobile/cli @blinkmobile/bmp-cli@'<'1
`);
    process.exit(1);
  }
}

function handleSitemap400 (err) {
  if (err.message === '400') {
    console.warn(`
Warning: unable to automatically refresh sitemap.

If you recently changed security settings or created new interactions
then you MUST view them in the /admin CMS to apply changes.

This will not be necessary with a future BMP service update.
`);
    return;
  }
  throw err;
}

module.exports = {
  handle404,
  handleSitemap400
};