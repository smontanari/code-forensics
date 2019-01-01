/*
 * code-forensics
 * Copyright (C) 2016-2019 Silvio Montanari
 * Distributed under the GNU General Public License v3.0
 * see http://www.gnu.org/licenses/gpl.html
 */

var StringDecoder = require('string_decoder').StringDecoder,
    LineStream    = require('byline').LineStream,
    filter        = require('through2-filter'),
    map           = require('through2-map');

module.exports = function(repository, developersInfo) {
  var AUTHOR_REGEXP = /^--[a-z0-9]+--[0-9-]+--(.*)$/;
  var PATH_REGEXP = /^(\d+|-)\s(\d+|-)\s(.*)$/;

  var decoder = new StringDecoder();
  var normaliseCommitAuthorData = function(line) {
    var match = AUTHOR_REGEXP.exec(line);
    if (match === null) { return line; }
    var authorName = match[1];
    var developer = developersInfo.find(authorName);
    return line.replace(authorName, developer.name);
  };

  var filterFileCommitData = function(line) {
    var match = PATH_REGEXP.exec(line.trim());
    if (match !== null) {
      return repository.isValidPath(match[3]);
    }
    return true;
  };

  this.normaliseLogStream = function(inputStream) {
    var firstLine = true;
    return inputStream
      .pipe(new LineStream({ keepEmptyLines: true }))
      .pipe(map(function(chunk) {
        var line = normaliseCommitAuthorData(decoder.write(chunk));
        if (firstLine) {
          firstLine = false;
          return line;
        }
        return "\n" + line;
      }))
      .pipe(filter(function(chunk) {
        return filterFileCommitData(decoder.write(chunk));
      }));
  };
};
