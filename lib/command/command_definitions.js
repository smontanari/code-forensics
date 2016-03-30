var Path               = require('path'),
    _                  = require('lodash'),
    appConfig          = require('../runtime/app_config');
    DefinitionsArchive = require('../utils').DefinitionsArchive;

var definitions = {
  gitlog_analysis: {
    cmd: 'git',
    args: ['log', '--all', '-M', '-C', '--numstat', '--date=short', '--no-renames', '--pretty=format:--%h--%ad--%an']
  },
  gitlog_messages: {
    cmd: 'git',
    args: ['log', '--date=short', '--pretty=format:%s']
  },
  gitlog_revisions: {
    cmd: 'git',
    args: ['log', '--date=iso', '--pretty=format:%h,%ad']
  },
  git_show: { cmd: 'git', args: ['show'] },
  codemaat: {
    cmd: 'java',
    args: [
      '-jar', '-Djava.awt.headless=true',
      Path.join(appConfig.basedir, 'lib/analysers/code_maat/code-maat-0.9.2-SNAPSHOT-standalone.jar'),
      '-c', 'git2'
    ]
  },
  sloc: { cmd: 'node_modules/sloc/bin/sloc', args: ['-f', 'json'] },
  flog: { cmd: 'flog', args: ['-a'] }
};

module.exports = _.tap(new DefinitionsArchive(), function(archive) {
  _.each(definitions, function(def, name) {
    archive.addDefinition(name, def);
  });
});
