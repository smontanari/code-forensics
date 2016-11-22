var appConfig = require('../runtime/app_config');

var adapters = {
  git: require('./adapters/git')
};

module.exports = function(repositoryRoot, developerInfo) {
  var Adapter = adapters[appConfig.get('versionControlSystem')];
  if (Adapter === undefined) {
    throw 'Cannot find vcs configuration for: ' + appConfig.get('versionControlSystem');
  }

  return new Adapter(repositoryRoot, developerInfo);
};
