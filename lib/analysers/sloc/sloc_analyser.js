var Path          = require('path'),
    chalk         = require('chalk'),
    _             = require('lodash'),
    sloc          = require('sloc'),
    StringDecoder = require('string_decoder').StringDecoder,
    utils         = require('../../utils');

var EXTENSION_MAPPING = {
  yml: 'yaml',
  erb: 'html'
};
var decoder = new StringDecoder();

module.exports = function() {
  var getExtension = function(path) {
    var ext = Path.extname(path).substring(1);
    return EXTENSION_MAPPING[ext] || ext;
  };

  var analyse = function(path, content, onError) {
    var ext = getExtension(path);
    if (_.includes(sloc.extensions, ext)) {
      var source = decoder.write(content);
      try {
        var stats = sloc(source, ext);
        return { path: file.path, sloc: stats.total };
      } catch (e) {
        onError(e);
      }
    }
  };

  this.sourceAnalysisStream = function(path) {
    return utils.stream.reduceToObjectStream(function(content) {
      return analyse(path, content, function(e) {
        utils.log(chalk.red("Error analysing content: " + e.message));
      });
    });
  };

  this.fileAnalysisStream = function(path) {
    utils.log(chalk.yellow("Analysing ") + chalk.grey(path));
    return utils.stream.readFileToObjectStream(path, function(content) {
      return analyse(path, content, function(e) {
        utils.log(chalk.red("Error analysing " + path + ": " + e.message));
      });
    });
  };
};
