#!/usr/bin/env node
// Thin wrapper — delegates to scripts/build-fusion-index.js
// Default directory is the project root (__dirname); pass a path to override.
process.argv[2] = process.argv[2] || __dirname;
require('./scripts/build-fusion-index.js');
