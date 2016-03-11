# Change Log


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
