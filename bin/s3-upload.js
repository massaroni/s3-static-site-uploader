#!/usr/bin/env node
var ConfigRunner = require('../src/ConfigRunner.js');
var path = require('path');

function getConfigLoader() {
  var configPath = process.argv[2] || './aws-upload.conf.js';
  var config = require(path.resolve(configPath));

  if (typeof(config) === 'function') {
    return config;
  }
  return function(callback) {
    callback(config);
  };
}

var runner = new ConfigRunner();
var loader = getConfigLoader();

loader(function(config) {
  runner.setConfig(config);
  runner.run(function(result) {
    var exitCode = result.errors > 0 ? 1 : 0;
    process.exit(exitCode);
  });
});
