/*
 * code-forensics
 * Copyright (C) 2016-2021 Silvio Montanari
 * Distributed under the GNU General Public License v3.0
 * see http://www.gnu.org/licenses/gpl.html
 */

var appConfig = require('../runtime/app_config');

var vcsRepos = {
  git:        require('./git'),
  subversion: require('./svn')
};

var getCurrentRepo = function() {
  var repo = vcsRepos[appConfig.get('versionControlSystem')];
    if (repo === undefined) {
      throw new Error('Cannot find vcs support files for: ' + appConfig.get('versionControlSystem'));
    }
  return repo;
};

module.exports = {
  adapter: function(repository) {
    var Adapter = getCurrentRepo().Adapter;

    return new Adapter(repository);
  },
  logStreamTransformer: function(repository, developersInfo) {
    var Transformer = getCurrentRepo().LogStreamTransformer;

    return new Transformer(repository, developersInfo, this.adapter(repository));
  }
};
