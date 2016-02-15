'use strict';

// Node.js built-ins

const path = require('path');

// this module

function ensureNewLine (code) {
  if (typeof code === 'string' && !code.length) {
    return '\n';
  }
  return code;
}

const PHP_OPEN = '?><?php\n';

function ensurePhpTags (code) {
  if (typeof code === 'string' && !code.startsWith(PHP_OPEN)) {
    return `${PHP_OPEN}${code}`;
  }
  return code;
}

function tailorPlan (plan) {
  return plan
    .map((op) => {
      switch (path.extname(op.targetPath)) {
        case '.php':
          return {
            targetPath: op.targetPath,
            value: ensurePhpTags(op.value)
          };

        case '.txt':
          return {
            targetPath: op.targetPath,
            value: ensureNewLine(op.value)
          };

        default:
          return op;
      }
    });
}

module.exports = {
  ensureNewLine,
  ensurePhpTags,
  tailorPlan
};
