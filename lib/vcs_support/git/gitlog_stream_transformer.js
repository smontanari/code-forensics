var StringDecoder = require('string_decoder').StringDecoder,
    LineStream    = require('byline').LineStream,
    filter        = require('through2-filter'),
    map           = require('through2-map');

module.exports = function(repository, developerInfo) {
  var AUTHOR_REGEXP = /^--[a-z0-9]+--[0-9-]+--(.*)$/;
  var PATH_REGEXP = /^(\d+|-)\s(\d+|-)\s(.*)$/;

  var decoder = new StringDecoder();
  var normaliseCommitAuthorData = function(line) {
    var match = AUTHOR_REGEXP.exec(line);
    if (match === null) { return line; }
    var authorName = match[1];
    var developer = developerInfo.find(authorName);
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
    return inputStream
      .pipe(new LineStream({ keepEmptyLines: true }))
      .pipe(map(function(chunk) {
        return normaliseCommitAuthorData(decoder.write(chunk)) + "\n";
      }))
      .pipe(filter(function (chunk) {
        return filterFileCommitData(decoder.write(chunk));
      }));
  };
};
