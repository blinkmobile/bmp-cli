# blinkmobile/bmp-cli

CLI utility for BlinkMobile's Mobility Platform

[![npm module](https://img.shields.io/npm/v/@blinkmobile/bmp-cli.svg)](https://www.npmjs.com/package/@blinkmobile/bmp-cli)
[![Build Status](https://travis-ci.org/blinkmobile/bmp-cli.svg?branch=master)](https://travis-ci.org/blinkmobile/bmp-cli)


## Installation

```sh
npm install -g @blinkmobile/cli @blinkmobile/bmp-cli
```


## Usage

```sh
blinkm bmp --help

# or, shorter
bm bmp --help
```

```
  Initial settings:
    scope           => outputs the current scope and login status
    scope [<url>]   => sets the current URL scope
    login           => store credentials on this machine
    logout          => remove credentials from this machine

  Getting work done:
    pull            => download remote configuration to local files
      --prune       => delete local files that are absent from remote
    deploy          => update remote configuration to match local files
      --prune       => delete remote interactions that are absent locally

  Creating new interactions:
    create interaction <name>
                    => creates a new hidden+active interaction locally
      --type=<type> => type can be "madl" (default), or "message"
      --remote      => also create a remote placeholder
```

We recommend that you skim our [suggested usage](docs/suggested-usage.md).


## Environment Variables


### BMP_SCOPE

By default, this tool determines your project scope by reading the .blinkmrc.json file in the current working directory or its parent directory (or its parent's parent directory, etc).
You may set this variable instead.


### BMP_USER_CONFIG_DIR

By default, this tool stores authentication data in the user's home directory.
You may set this variable to control this location.


### BMP_WORKING_DIR

By default, this tool looks for the .blinkmrc.json file in the current working directory, and stores project files there, too.
You may set this variable to control this location.
