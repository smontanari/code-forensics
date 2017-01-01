var Path          = require('path'),
    fs            = require('fs'),
    StringDecoder = require('string_decoder').StringDecoder,
    utils         = require('../utils');

module.exports = function() {
  var file = Path.resolve('.code-forensics');
  var decoder = new StringDecoder();

  this.getConfiguration = function() {
    if (utils.fileSystem.isFile(file)) {
      return JSON.parse(decoder.write(fs.readFileSync(file)));
    }
    return {};
  };
};
