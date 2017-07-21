/*
 * code-forensics
 * Copyright (C) 2016-2017 Silvio Montanari
 * Distributed under the GNU General Public License v3.0
 * see http://www.gnu.org/licenses/gpl.html
 */

var Path      = require('path'),
    stream    = require('stream'),
    _         = require('lodash'),
    multipipe = require('multipipe'),
    csv       = require('fast-csv'),
    logger    = require('../../log').Logger,
    command   = require('../../command'),
    appConfig = require('../../runtime/app_config');

var ANALYSIS_CONFIG = {
  'revisions': {
    parse: function(row) {
      return {
        path:      row.entity,
        revisions: parseInt(row['n-revs'])
      };
    }
  },
  'soc': {
    parse: function(row) {
      return {
        path: row.entity,
        soc:  parseInt(row.soc)
      };
    }
  },
  'coupling': {
    parse: function(row) {
      return {
        path:           row.entity,
        coupledPath:    row.coupled,
        couplingDegree: parseInt(row.degree),
        revisionsAvg:   parseInt(row['average-revs'])
      };
    }
  },
  'authors': {
    parse: function(row) {
      return {
        path:      row.entity,
        authors:   parseInt(row['n-authors']),
        revisions: parseInt(row['n-revs'])
      };
    }
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
    unsupportedVcsTypes: ['subversion']
  },
  'entity-effort': {
    parse: function(row) {
      return {
        path:      row.entity,
        author:    row.author,
        revisions: parseInt(row['author-revs'])
      };
    }
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
    unsupportedVcsTypes: ['subversion']
  },
  'communication': {
    parse: function(row) {
      return {
        author:           row.author,
        coupledAuthor:    row.peer,
        sharedCommits:    parseInt(row.shared),
        couplingStrength: parseInt(row.strength)
      };
    }
   },
   'absolute-churn': {
    parse: function(row) {
      return {
        date:         row.date,
        addedLines:   parseInt(row.added),
        deletedLines: parseInt(row.deleted),
        commits:      parseInt(row.commits)
      };
    },
    unsupportedVcsTypes: ['subversion']
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
    unsupportedVcsTypes: ['subversion']
  }
};

var codeMaatPackage = appConfig.get('codeMaat.packageFile') || Path.join(__dirname, 'code-maat-1.0-SNAPSHOT-standalone.jar');

command.Command.definitions.addDefinition('codemaat', {
  cmd: 'java',
  args: [
    '-Djava.awt.headless=true',
    { '-jar': codeMaatPackage }
  ],
  installCheck: function() {
    this.verifyExecutable('java', 'Cannot find the java commmand.');
    this.verifyFile(codeMaatPackage, 'Cannot find the codemaat jar at: ' + codeMaatPackage);
  }
});

var VCS_TYPE = {
  subversion: 'svn',
  git:        'git2',
  mercurial:  'hg'
};

module.exports = function(instruction) {
  command.Command.ensure('codemaat');
  var analysisConfig = ANALYSIS_CONFIG[instruction];

  this.fileAnalysisStream = function(inputFile, options) {
    var vcsType = appConfig.get('versionControlSystem');

    if (_.includes(_.get(analysisConfig, 'unsupportedVcsTypes', []), vcsType)) {
      logger.warn('CodeMaat ' + instruction + ' analysis not available on ' + vcsType + ' repository');
      return _.tap(new stream.PassThrough(), function(s) { s.end(); });
    }

    var additionalOptions = _.extend({}, options, appConfig.get('codeMaat.options'));
    var args = [
      {
        '-c': VCS_TYPE[vcsType],
        '-l': inputFile,
        '-a': instruction
      },
      additionalOptions
    ];

    return multipipe(
      command.stream('codemaat', args),
      csv({ headers: true, ignoreEmpty: true, strictColumnHandling: true })
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
