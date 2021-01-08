/*
 * code-forensics
 * Copyright (C) 2016-2021 Silvio Montanari
 * Distributed under the GNU General Public License v3.0
 * see http://www.gnu.org/licenses/gpl.html
 */

var stream    = require('stream'),
    fs        = require('fs'),
    Path      = require('path'),
    _         = require('lodash'),
    multipipe = require('multipipe'),
    csv       = require('fast-csv'),
    logger    = require('../../log'),
    command   = require('../../command'),
    appConfig = require('../../runtime/app_config');

var ANALYSIS_CONFIG = {
  'revisions': {
    parse: function(row) {
      return {
        path:      row.entity,
        revisions: parseInt(row['n-revs'])
      };
    },
    supportedVcsTypes: ['git', 'subversion']
  },
  'summary': {
    parse: function(row) {
      var statMapping = {
        'number-of-commits':          'commits',
        'number-of-entities':         'files',
        'number-of-entities-changed': 'revisions',
        'number-of-authors':          'authors'
      };
      return {
        stat:  statMapping[row.statistic],
        value: parseInt(row.value)
      };
    },
    supportedVcsTypes: ['git', 'subversion']
  },
  'soc': {
    parse: function(row) {
      return {
        path: row.entity,
        soc:  parseInt(row.soc)
      };
    },
    supportedVcsTypes: ['git', 'subversion']
  },
  'coupling': {
    parse: function(row) {
      return {
        path:           row.entity,
        coupledPath:    row.coupled,
        couplingDegree: parseInt(row.degree),
        revisionsAvg:   parseInt(row['average-revs'])
      };
    },
    supportedVcsTypes: ['git', 'subversion']
  },
  'authors': {
    parse: function(row) {
      return {
        path:      row.entity,
        authors:   parseInt(row['n-authors']),
        revisions: parseInt(row['n-revs'])
      };
    },
    supportedVcsTypes: ['git', 'subversion']
  },
  'main-dev': {
    parse: function(row) {
      return {
        path:       row.entity,
        author:     row['main-dev'],
        addedLines: parseInt(row.added),
        ownership:  Math.round(parseFloat(row.ownership) * 100)
      };
    },
    supportedVcsTypes: ['git']
  },
  'entity-effort': {
    parse: function(row) {
      return {
        path:      row.entity,
        author:    row.author,
        revisions: parseInt(row['author-revs'])
      };
    },
    supportedVcsTypes: ['git', 'subversion']
  },
  'entity-ownership': {
    parse: function(row) {
      return {
        path:         row.entity,
        author:       row.author,
        addedLines:   parseInt(row.added),
        deletedLines: parseInt(row.deleted)
      };
    },
    supportedVcsTypes: ['git']
  },
  'communication': {
    parse: function(row) {
      return {
        author:           row.author,
        coupledAuthor:    row.peer,
        sharedCommits:    parseInt(row.shared),
        couplingStrength: parseInt(row.strength)
      };
    },
    supportedVcsTypes: ['git', 'subversion']
   },
   'abs-churn': {
    parse: function(row) {
      return {
        date:         row.date,
        addedLines:   parseInt(row.added),
        deletedLines: parseInt(row.deleted),
        commits:      parseInt(row.commits)
      };
    },
    supportedVcsTypes: ['git']
   },
   'entity-churn': {
    parse: function(row) {
      return {
        path:         row.entity,
        addedLines:   parseInt(row.added),
        deletedLines: parseInt(row.deleted),
        commits:      parseInt(row.commits)
      };
    },
    supportedVcsTypes: ['git']
  }
};

var VCS_PARAM = {
  subversion: 'svn',
  git:        'git2'
};

module.exports = function(instruction) {
  var vcsType = appConfig.get('versionControlSystem');
  var dockerEnabled = appConfig.get('codeMaat.docker') !== undefined;
  var codeMaatCommand = dockerEnabled ? 'codemaat-docker' : 'codemaat';
  command.Command.ensure(codeMaatCommand);

  var analysisConfig = ANALYSIS_CONFIG[instruction];
  if (_.isUndefined(analysisConfig)) throw new Error('Analysis "' + instruction + '" not configured');

  var emptyStream = function() {
    return _.tap(new stream.PassThrough(), function(s) { s.end(); });
  };

  var filePath = function(file) {
    if (dockerEnabled) {
      var config = command.Command.getConfig(codeMaatCommand);
      return Path.join(config.containerVolume, Path.relative(config.hostVolume, file));
    }
    return file;
  };

  var groupOption = function(file) {
    if (file) {
      if (fs.statSync(file).size === 0) {
        logger.warn('Empty group file ' + file);
      } else {
        return { '-g': filePath(file) };
      }
    }
    return {};
  };

  this.isSupported = _.memoize(function() { return _.includes(analysisConfig.supportedVcsTypes, vcsType); });

  this.fileAnalysisStream = function(logFile, groupFile, options) {
    if (!this.isSupported()) {
      logger.warn('CodeMaat ' + instruction + ' analysis not supported on ' + vcsType + ' repository');
      return emptyStream();
    }

    if (fs.statSync(logFile).size === 0) {
      logger.warn('Empty log file ' + logFile);
      return emptyStream();
    }

    var additionalOptions = _.extend(groupOption(groupFile), options, appConfig.get('codeMaat.options'));
    var args = [
      {
        '-c': VCS_PARAM[vcsType],
        '-l': filePath(logFile),
        '-a': instruction
      },
      additionalOptions
    ];

    return multipipe(
      command.stream(codeMaatCommand, args),
      csv.parse({ headers: true, ignoreEmpty: true, strictColumnHandling: true })
        .transform(function(data) {
          if (_.isPlainObject(data)) { return analysisConfig.parse(data); }
        })
      )
      .on('error', function(err) {
        logger.error('Error streaming CodeMaat output: ' + err.toString());
      })
      .once('data-invalid', function(data) {
        logger.warn('Invalid CodeMaat output: >>' + data);
      });
  };
};
