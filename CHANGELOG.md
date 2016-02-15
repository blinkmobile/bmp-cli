# Change Log


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
