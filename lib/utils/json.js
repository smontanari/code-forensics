var fs            = require('fs'),
    StringDecoder = require('string_decoder').StringDecoder,
    Q             = require('q'),
    map           = require('through2-map'),
    JSONStream    = require('JSONStream'),
    multipipe     = require('multipipe');

var decoder = new StringDecoder();

module.exports = {
  objectToFileStream: function(filepath) {
    return multipipe(
      map.obj(function(obj) { return JSON.stringify(obj, null, 2) + "\n"; }),
      fs.createWriteStream(filepath)
    );
  },
  objectArrayToFileStream: function(filepath) {
    return multipipe(JSONStream.stringify('[\n', ',\n', '\n]\n'), fs.createWriteStream(filepath));
  },
  objectToFile: function(filepath, obj) {
    fs.writeFile(filepath, JSON.stringify(obj, null, 2));
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
