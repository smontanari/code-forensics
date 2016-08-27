var _             = require('lodash'),
    chalk         = require('chalk'),
    escomplex     = require('escomplex'),
    Parser        = require('./parser'),
    StringDecoder = require('string_decoder').StringDecoder,
    utils         = require('../../utils'),
    appConfig     = require('../../runtime/app_config');

var decoder = new StringDecoder();

module.exports = function() {
  var jsParser;
  if (_.isPlainObject(appConfig.javascriptParser) && _.isString(appConfig.javascriptParser.module)) {
    jsParser = Parser.create(appConfig.javascriptParser.module, appConfig.javascriptParser.options);
  }

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
      var report = escomplex.analyse(decoder.write(content), {noCoreSize: true}, jsParser);
      var functionComplexity = fnComplexityParser(report.functions);
      var complexityReport = {
        path: filepath,
        totalComplexity: report.aggregate.cyclomatic,
        averageComplexity: _.mean(_.map(functionComplexity, 'complexity')),
        methodComplexity: functionComplexity
      };

      if (_.isFunction(transformFn)) {
        return transformFn(complexityReport);
      }
      return complexityReport;
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
