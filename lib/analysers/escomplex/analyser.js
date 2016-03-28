var _         = require('lodash'),
    chalk     = require('chalk'),
    escomplex = require('escomplex'),
    utils     = require('../../utils');

module.exports = function() {
  var fnComplexityParser = function(reportFns) {
    return reportFns.map(function(fnReport) {
      return {
        name: fnReport.name,
        complexity: fnReport.cyclomatic
      };
    });
  };

  var analyseContent = function(contents, onError) {
    try {
      var report = escomplex.analyse(contents, {noCoreSize: true});
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

  this.stringAnalysis = function(contents) {
    return analyseContent(contents, function(e) {
      utils.log(chalk.red("Error analysing content: " + e.message));
    });
  };

  this.fileAnalysis = function(file) {
    utils.log(chalk.yellow("Analysing ") + chalk.grey(file.path));
    return analyseContent(file.contents, function(e) {
      utils.log(chalk.red("Error analysing " + file.path + ": " + e.message));
    });
  };
};
