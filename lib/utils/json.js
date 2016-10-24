var _             = require('lodash'),
    fs            = require('fs'),
    StringDecoder = require('string_decoder').StringDecoder,
    Q             = require('q'),
    map           = require('through2-map'),
    JSONStream    = require('JSONStream'),
    multipipe     = require('multipipe');

var decoder = new StringDecoder();

module.exports = {
  objectToFileStream: function(filepath, sourceStream) {
    return _.tap(fs.createWriteStream(filepath), function(destStream) {
      sourceStream.pipe(multipipe(
        map.obj(function(obj) { return JSON.stringify(obj, null, 2) + "\n"; }), destStream)
      );
    });
  },
  objectArrayToFileStream: function(filepath, sourceStream) {
    return _.tap(fs.createWriteStream(filepath), function(destStream) {
      sourceStream.pipe(multipipe(JSONStream.stringify('[\n', ',\n', '\n]\n'), destStream));
    });
  },
  objectToFile: function(filepath, obj) {
    return Q.nfcall(fs.writeFile, filepath, JSON.stringify(obj, null, 2));
  },
  fileToObject: function(filepath) {
    return Q.nfcall(fs.readFile, filepath)
    .then(function(buffer) {
      return JSON.parse(decoder.write(buffer));
    });
  },
  fileToObjectStream: function(filepath, parseExpression) {
    var pattern = parseExpression || '*';
    return fs.createReadStream(filepath).pipe(JSONStream.parse(pattern));
  }
};
