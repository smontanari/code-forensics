var Path = require('path');

module.exports = function(tempDir, outputDir) {
  var tempPath = function(path) {
    return Path.join(tempDir, path);
  };

  var outputPath = function(path) {
    return Path.join(outputDir, path);
  };

  return {
    temp: {
      vcslog: function(period) { return tempPath('vcslog_' + period.toString() + '.log'); },
      vcslogMessages: function(period) { return tempPath('vcslog_messages_' + period.toString() + '.log'); },
      sloc: function() { return tempPath('sloc-analysis.json'); },
      codeBoundaries: function() { return tempPath('code_boundaries.txt'); },
      codeComplexity: function(language) { return tempPath(language + '-complexity-analysis.json'); },
      revisions: function() { return tempPath('revisions-analysis.json'); },
      authors: function() { return tempPath('authors-analysis.json'); }
    },
    output: {
      reportFolder: function(reportId) { return Path.join(outputDir, reportId); },
      reportFile: function(reportId, filename) { return Path.join(outputDir, reportId, filename); },
      systemEvolution: function(boundaryName) { return outputPath(boundaryName + '_evolution-data.json'); },
      systemCoupling: function(boundaryName) { return outputPath(boundaryName + '_coupling-data.json'); },
      commitCloud: function(period) { return outputPath("commit-cloud-data_" + period.toString() + ".json"); }
    }
  };
};
