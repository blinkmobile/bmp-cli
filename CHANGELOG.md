# Change Log


## 1.1.0 - 2016-08-29


### Security

- addressed security advisory: https://snyk.io/vuln/npm:tough-cookie:20160722


### Adds

- BC-34: `deploy --only` flag for selective deployment (#70, @jokeyrhyme), e.g.

    - `bm bmp deploy --only answerSpace.*` only the top-level

    - `bm bmp deploy --only interactions/**/*.html` only interactions related to HTML files

    - `bm bmp deploy --only interactions/name/**/*` only "name" interaction

    - note: this will still deploy a whole resource at a minimum, not the part related to the specified files

    - note: if you get errors, check that your wildcards actually match expected files


### Changed

- BC-29: bumped [async](https://www.npmjs.com/package/async) to 2.0.1 (#61, @jokeyrhyme)

- BC-29: bumped [request](https://www.npmjs.com/package/request) to 2.74.0


### Fixed

- BC-24: protocol-free scopes fallback to HTTPS (#73, @jokeyrhyme)

    - means you don't need to type in the "https://" and it should still work

- BC-32: add missing documentation for how to change file extensions (#68, @jokeyrhyme)

    - see: https://github.com/blinkmobile/bmp-cli/blob/master/docs/customisation.md

- BC-33: helpful messages for ERROR_SCOPE_CONTENT_MISMATCH, ERROR_SCOPE_INVALID, and ERROR_SCOPE_NOT_SET (#72, @jokeyrhyme)

    - for these errors, messages are more instructional and no longer include stack traces

    - HelpDesk: 9581-RULX-4483


## 1.0.1 - 2016-05-27


### Fixed

- BC-25: `create --remote` and `deploy` trigger sitemap regeneration (#20, @jokeyrhyme)

    - previously, new interactions and/or security settings would not be visible to BMP clients (e.g. BIC, interaction/run endpoints, etc)

    - requires server-side changes, BMP 3.0.1 does _not_ meet the requirements

    - requires a BMP release that includes PLATFORM-1647


## 1.0.0 - 2016-05-09


### Added

- `bm bmp login` immediately attempts to use new credentials, and shows the result

    - does not store rejected credentials

- `bm bmp scope` also attempts to use stored credentials, and shows the result

- added instructions to use an older CLI with older BMP services when appropriate


### Changed

- BC-17: use new v2 APIs in BMP exclusively (#17, @jokeyrhyme)

- BC-17: `bm bmp login` only accepts a [JWT](https://jwt.io/), rejects anything else (#17, @jokeyrhyme)

- no more `bm bmp whoami` command, it's gone


## 0.5.1 - 2016-03-11


### Fixed

- BC-22: `pull` and `deploy` commands abort if the target scope does not match the "name" field in the primary JSON file (#16, @jokeyrhyme)

    - prevents further data-loss in cases of corrupted local files or unexpected scope changes

- BC-22: GET requests fail if the result's ID doesn't match the requested ID

    - prevents corruption of local files

- the progress bar during `deploy` works again (broken during BC-18, #15)


## 0.5.0 - 2016-02-26


### Changed

- BC-20: extract config file management for use in other CLIs (#14, @jokeyrhyme)

    - https://github.com/blinkmobile/blinkmrc.js


### Fixed

- BC-18: do not attempt to deploy extra files, e.g. .DS_Store, etc (#15, @jokeyrhyme)


## 0.4.0 - 2016-02-15


### Added

- BC-10: display progress bars during `pull` and `deploy` (#9, @jokeyrhyme) (fixes #4)

- BC-11: `blinkm bmp pull --prune` deletes local files missing on remote (#11, @jokeyrhyme)

- BC-15: `blinkm bmp deploy --prune` (#12, @jokeyrhyme)

- BC-13: able to create interactions via CLI with no actions within CMS (#10, @jokeyrhyme)

    - all interactions created this way have "display" set to "hide" to avoid visible disruption to BIC end-users (avoids unfinished interactions showing up in generated lists)

    - `blinkm bmp create interaction <name>`  creates a new hidden+active interaction locally

        - `--type=<type>` where type can be "madl" (default), or "message"

        - `--remote` create a remote placeholder

- copy `--help` documentation out to README.md


### Changed

- BC-11: `blinkm bmp pull` (regardless of `--prune`) preserves existing / customised "$file" references in local files (#11, @jokeyrhyme)


## 0.3.0 - 2016-02-05


### Added

- BC-4: `blinkm bmp whoami` verifies and displays current credential information

- BC-6: `blinkm bmp pull` downloads project data to the local directory

- BC-7: `blinkm bmp deploy` uploads project data from the local directory


### Changed

- BC-5: outgoing requests are always HTTPS now, regardless of scope


### Fixed

- BC-8: the npm package now includes all the necessary files
