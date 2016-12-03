var appConfig = require('../runtime/app_config');

var vcsRepos = {
  git: require('./git')
};

var getCurrentRepo = function() {
  var repo = vcsRepos[appConfig.get('versionControlSystem')];
    if (repo === undefined) {
      throw 'Cannot find vcs support files for: ' + appConfig.get('versionControlSystem');
    }
  return repo;
};

module.exports = {
  adapter: function(repository) {
    var Adapter = getCurrentRepo().Adapter;

    return new Adapter(repository);
  },
  logStreamTransformer: function(repository, developerInfo) {
    var Transformer = getCurrentRepo().LogStreamTransfomer;

    return new Transformer(repository, developerInfo);
  }
};
