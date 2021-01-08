/*
 * code-forensics
 * Copyright (C) 2016-2021 Silvio Montanari
 * Distributed under the GNU General Public License v3.0
 * see http://www.gnu.org/licenses/gpl.html
 */

var _             = require('lodash'),
    fs            = require('fs'),
    StringDecoder = require('string_decoder').StringDecoder,
    Bluebird      = require('bluebird'),
    map           = require('through2-map'),
    JSONStream    = require('JSONStream'),
    multipipe     = require('multipipe');

var decoder = new StringDecoder();

module.exports = {
  //TODO: rename objectStreamToFileStream
  objectToFileStream: function(filepath, sourceStream) {
    return _.tap(fs.createWriteStream(filepath), function(destStream) {
      sourceStream.pipe(
        multipipe(
          map.obj(function(obj) { return JSON.stringify(obj, null, 2) + '\n'; }),
          destStream
        )
      );
    });
  },
  //TODO: rename arrayStreamToFileStream
  objectArrayToFileStream: function(filepath, sourceStream) {
    return _.tap(fs.createWriteStream(filepath), function(destStream) {
      sourceStream.pipe(multipipe(JSONStream.stringify('[\n', ',\n', '\n]\n'), destStream));
    });
  },
  objectToFile: function(filepath, obj) {
    var writeFile = Bluebird.promisify(fs.writeFile);
    return writeFile(filepath, JSON.stringify(obj, null, 2));
  },
  fileToObject: function(filepath) {
    var readFile = Bluebird.promisify(fs.readFile);
    return readFile(filepath)
      .then(function(buffer) {
        return JSON.parse(decoder.write(buffer));
      });
  },
  fileToObjectStream: function(filepath, parseExpression) {
    var pattern = parseExpression || '*';
    return fs.createReadStream(filepath).pipe(JSONStream.parse(pattern));
  }
};
