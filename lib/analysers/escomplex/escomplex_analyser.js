var _               = require('lodash'),
    chalk           = require('chalk'),
    escomplexCore   = require('escomplex/src/core'),
    escomplexWalker = require('escomplex/src/walker'),
    StringDecoder   = require('string_decoder').StringDecoder,
    Parser          = require('./parser'),
    utils           = require('../../utils');

var decoder = new StringDecoder();

module.exports = function() {
  var jsParser = Parser.create();

  var fnComplexityParser = function(reportFns) {
    return reportFns.map(function(fnReport) {
      return {
        name: fnReport.name,
        complexity: fnReport.cyclomatic
      };
    });
  };

  var analyse = function(filepath, content, transformFn, onError) {
    try {
      var ast = jsParser.parse(decoder.write(content));
      var report = escomplexCore.analyse(ast, escomplexWalker, {noCoreSize: true});
      var functionComplexity = fnComplexityParser(report.functions);
      var report = {
        path: filepath,
        totalComplexity: report.aggregate.cyclomatic,
        averageComplexity: _.mean(_.map(functionComplexity, 'complexity')),
        methodComplexity: functionComplexity
      };

      if (_.isFunction(transformFn)) {
        return transformFn(report);
      }
      return report;
    } catch(e) {
      onError(e);
    }
  };

  this.sourceAnalysisStream = function(filepath, transformFn) {
    return utils.stream.reduceToObjectStream(function(content) {
      return analyse(filepath, content, transformFn, function(e) {
        utils.log(chalk.red("Error analysing content: " + e.message));
      });
    });
  };

  this.fileAnalysisStream = function(filepath, transformFn) {
    utils.log(chalk.yellow("Analysing ") + chalk.grey(filepath));
    return utils.stream.readFileToObjectStream(filepath, function(content) {
      return analyse(filepath, content, transformFn, function(e) {
        utils.log(chalk.red("Error analysing " + filepath + ": " + e.message));
      });
    });
  };
};
