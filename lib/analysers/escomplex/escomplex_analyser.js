var _             = require('lodash'),
    chalk         = require('chalk'),
    escomplex     = require('escomplex'),
    StringDecoder = require('string_decoder').StringDecoder,
    utils         = require('../../utils');

var decoder = new StringDecoder();

module.exports = function() {
  var fnComplexityParser = function(reportFns) {
    return reportFns.map(function(fnReport) {
      return {
        name: fnReport.name,
        complexity: fnReport.cyclomatic
      };
    });
  };

  var analyse = function(content, onError) {
    try {
      var report = escomplex.analyse(decoder.write(content), {noCoreSize: true});
      var functionComplexity = fnComplexityParser(report.functions);
      return {
        totalComplexity: report.aggregate.cyclomatic,
        averageComplexity: _.mean(_.map(functionComplexity, 'complexity')),
        methodComplexity: functionComplexity
      };
    } catch(e) {
      onError(e);
    }
  };

  this.sourceAnalysisStream = function() {
    return utils.stream.reduceToObjectStream(function(content) {
      return analyse(content, function(e) {
        utils.log(chalk.red("Error analysing content: " + e.message));
      });
    });
  };

  this.fileAnalysisStream = function(path) {
    utils.log(chalk.yellow("Analysing ") + chalk.grey(path));
    return utils.stream.readFileToObjectStream(path, function(content) {
      return analyse(content, function(e) {
        utils.log(chalk.red("Error analysing " + path + ": " + e.message));
      });
    });
  };
};
