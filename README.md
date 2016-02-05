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
