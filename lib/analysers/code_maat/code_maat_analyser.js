var Path      = require('path'),
    _         = require('lodash'),
    multipipe = require('multipipe'),
    csv       = require('fast-csv'),
    logger    = require('../../log').Logger,
    command   = require('../../command'),
    appConfig = require('../../runtime/app_config');

var PARSER_INSTRUCTIONS = {
  'revisions': function(row) {
    return {
      path:      row.entity,
      revisions: parseInt(row['n-revs'])
    };
  },
  'soc': function(row) {
    return {
      path: row.entity,
      soc:  parseInt(row.soc)
    };
  },
  'coupling': function(row) {
    return {
      path:           row.entity,
      coupledPath:    row.coupled,
      couplingDegree: parseInt(row.degree),
      revisionsAvg:   parseInt(row['average-revs'])
    };
  },
  'authors': function(row) {
    return {
      path:      row.entity,
      authors:   parseInt(row['n-authors']),
      revisions: parseInt(row['n-revs'])
    };
  },
  'main-dev': function(row) {
    return {
      path:       row.entity,
      author:     row['main-dev'],
      addedLines: parseInt(row.added),
      ownership:  Math.round(parseFloat(row.ownership) * 100)
    };
  },
  'entity-effort': function(row) {
    return {
      path:      row.entity,
      author:    row.author,
      revisions: parseInt(row['author-revs'])
    };
  },
  'entity-ownership': function(row) {
    return {
      path:         row.entity,
      author:       row.author,
      addedLines:   parseInt(row.added),
      deletedLines: parseInt(row.deleted)
    };
  },
  'communication': function(row) {
    return {
      author:           row.author,
      coupledAuthor:    row.peer,
      sharedCommits:    parseInt(row.shared),
      couplingStrength: parseInt(row.strength)
    };
   },
   'absolute-churn': function(row) {
    return {
      date:         row.date,
      addedLines:   parseInt(row.added),
      deletedLines: parseInt(row.deleted),
      commits:      parseInt(row.commits)
    };
   },
   'entity-churn': function(row) {
    return {
      path:         row.entity,
      addedLines:   parseInt(row.added),
      deletedLines: parseInt(row.deleted),
      commits:      parseInt(row.commits)
    };
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

  this.fileAnalysisStream = function(inputFile, options) {
    var additionalOptions = _.extend({}, options, appConfig.get('codeMaat.options'));
    var args = [
      {
        '-c': VCS_TYPE[appConfig.get('versionControlSystem')],
        '-l': inputFile,
        '-a': instruction
      },
      additionalOptions
    ];

    return multipipe(
      command.stream('codemaat', args),
      csv({ headers: true, ignoreEmpty: true, strictColumnHandling: true })
        .transform(function(data) {
          if (_.isPlainObject(data)) { return PARSER_INSTRUCTIONS[instruction](data); }
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
