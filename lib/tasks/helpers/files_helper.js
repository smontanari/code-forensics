/*
 * code-forensics
 * Copyright (C) 2016-2021 Silvio Montanari
 * Distributed under the GNU General Public License v3.0
 * see http://www.gnu.org/licenses/gpl.html
 */

var Path = require('path');

module.exports = function(context) {
  var tempPath = function(path) {
    return Path.join(context.tempDir, path);
  };

  return {
    vcslog:            function(period) { return tempPath('vcslog_' + period.toString() + '.log'); },
    vcsNormalisedLog:  function(period) { return tempPath('vcslog_normalised_' + period.toString() + '.log'); },
    vcsCommitMessages: function(period) { return tempPath('vcs_commit_messages_' + period.toString() + '.log'); },
    sloc:              function() { return tempPath('sloc-report.json'); },
    layerGrouping:     function(layerName) {
      return layerName ? tempPath('layer-group-' + layerName + '.txt') : tempPath('layer-groups.txt');
    },
    codeComplexity:    function(language) { return tempPath(language + '-complexity-report.json'); },
    revisions:         function() { return tempPath('revisions-report.json'); },
    authors:           function() { return tempPath('authors-report.json'); },
    mainDeveloper:     function() { return tempPath('main-dev-report.json'); },
    codeOwnership:     function() { return tempPath('code-ownership-report.json'); },
    effort:            function() { return tempPath('effort-report.json'); }
  };
};
