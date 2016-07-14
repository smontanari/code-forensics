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

  var analyse = function(filepath, content, transformFn, onError) {
    var ext = getExtension(filepath);
    if (_.includes(sloc.extensions, ext)) {
      var source = decoder.write(content);
      try {
        var stats = sloc(source, ext);
        var report = { path: filepath, sloc: stats.total };

        if (_.isFunction(transformFn)) {
          return transformFn(report);
        }
        return report;
      } catch (e) {
        onError(e);
      }
    }
  };

  this.sourceAnalysisStream = function(filepath, transformFn) {
    return utils.stream.reduceToObjectStream(function(content) {
      return analyse(filepath, content, transformFn, function(e) {
        utils.log(chalk.red("Error analysing content: " + e.message));
      });
    });
  };

  this.fileAnalysisStream = function(filepath, reportTransform) {
    utils.log(chalk.yellow("Analysing ") + chalk.grey(filepath));
    return utils.stream.readFileToObjectStream(filepath, function(content) {
      return analyse(filepath, content, reportTransform, function(e) {
        utils.log(chalk.red("Error analysing " + filepath + ": " + e.message));
      });
    });
  };
};
