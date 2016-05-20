var fs            = require('fs'),
    StringDecoder = require('string_decoder').StringDecoder,
    Q             = require('q'),
    map           = require("through2-map"),
    JSONStream    = require('JSONStream'),
    multipipe     = require('multipipe');

var decoder = new StringDecoder();

module.exports = {
  objectToFileStream: function(path) {
    return multipipe(
      map.obj(function(obj) { return JSON.stringify(obj, null, 2) + "\n"; }),
      fs.createWriteStream(path)
    );
  },
  objectArrayToFileStream: function(path) {
    return multipipe(JSONStream.stringify('[\n', ',\n', '\n]\n'), fs.createWriteStream(path));
  },
  objectToFile: function(path, obj) {
    fs.writeFile(path, JSON.stringify(obj, null, 2));
  },
  fileToObject: function(file) {
    return Q.nfcall(fs.readFile, file)
    .then(function(buffer) {
      return JSON.parse(decoder.write(buffer));
    });
  }
};
