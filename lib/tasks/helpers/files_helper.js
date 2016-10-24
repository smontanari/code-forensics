var Path = require('path');

module.exports = function(context) {
  var tempPath = function(path) {
    return Path.join(context.tempDir, path);
  };

  return {
    vcslog: function(period) { return tempPath('vcslog_' + period.toString() + '.log'); },
    vcsCommitMessages: function(period) { return tempPath('vcs_commit_messages_' + period.toString() + '.log'); },
    sloc: function() { return tempPath('sloc-analysis.json'); },
    codeBoundaries: function() { return tempPath('code_boundaries.txt'); },
    codeComplexity: function(language) { return tempPath(language + '-complexity-analysis.json'); },
    revisions: function() { return tempPath('revisions-analysis.json'); },
    authors: function() { return tempPath('authors-analysis.json'); },
    mainDev: function() { return tempPath('main-dev-analysis.json'); },
    effort: function() { return tempPath('effort-analysis.json'); }
  };
};
