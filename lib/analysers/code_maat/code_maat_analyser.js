var Path      = require('path'),
    _         = require('lodash'),
    multipipe = require('multipipe'),
    csv       = require('csv'),
    command   = require('../../command'),
    appConfig = require('../../runtime/app_config');

var PARSER_INSTRUCTIONS = {
  'revisions': function(row) {
    return {
      path: row[0],
      revisions: parseInt(row[1])
    };
  },
  'soc': function(row) {
    return {
      path: row[0],
      soc: parseInt(row[1])
    };
  },
  'coupling': function(row) {
    return {
      path: row[0],
      coupledPath: row[1],
      couplingDegree: parseInt(row[2]),
      revisionsAvg: parseInt(row[3])
    };
  },
  'authors': function(row) {
    return {
      path: row[0],
      authors: parseInt(row[1]),
      revisions: parseInt(row[2])
    };
  },
  'main-dev': function(row) {
    return {
      path: row[0],
      author: row[1],
      addedLines: parseInt(row[2]),
      ownership: Math.round(parseFloat(row[4]) * 100)
    };
  },
  'entity-effort': function(row) {
    return {
      path: row[0],
      author: row[1],
      revisions: parseInt(row[2])
    };
  },
  'entity-ownership': function(row) {
    return {
      path: row[0],
      author: row[1],
      addedLines: parseInt(row[2]),
      deletedLines: parseInt(row[3])
    };
  },
  'communication': function(row) {
    return {
      author: row[0],
      coupledAuthor: row[1],
      sharedCommits: parseInt(row[2]),
      couplingStrength: parseInt(row[4])
    };
   }
};

command.Command.definitions.addDefinition('codemaat', {
  cmd: 'java',
  args: [
    '-Djava.awt.headless=true',
    { '-jar': Path.join(__dirname, 'code-maat-1.0-SNAPSHOT-standalone.jar') }
  ],
  installCheck: function() {
    this.findExecutable('java', 'Cannot find the java commmand.');
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
    var additionalOptions = _.extend({}, options, appConfig.get('codeMaatOptions'));
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
      csv.parse(),
      csv.transform(_.after(2, PARSER_INSTRUCTIONS[instruction]))
    );
  };
};
