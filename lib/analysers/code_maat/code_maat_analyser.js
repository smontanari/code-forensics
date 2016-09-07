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
      couplingDegree: parseFloat(row[2]),
      revisionsAvg: parseFloat(row[3])
    };
  },
  'authors': function(row) {
    return {
      path: row[0],
      authors: parseInt(row[1]),
      revisions: parseInt(row[2])
    };
  },
  'entity-ownership': function(row) {
    return {
      path: row[0],
      author: row[1],
      added: parseInt(row[2])
    };
  }
};

command.Command.definitions.addDefinition('codemaat', {
  cmd: 'java',
  args: [
    '-jar', '-Djava.awt.headless=true',
    Path.join(__dirname, 'code-maat-1.0-SNAPSHOT-standalone.jar')
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

  this.fileAnalysisStream = function(inputFile, additionalArgs) {
    var args = ['-c', VCS_TYPE[appConfig.get('versionControlSystem')], '-l', inputFile, '-a', instruction].concat(additionalArgs || []);
    return multipipe(
      command.stream('codemaat', args),
      csv.parse(),
      csv.transform(_.after(2, PARSER_INSTRUCTIONS[instruction]))
    );
  };
};
