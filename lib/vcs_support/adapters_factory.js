var appConfig = require('../runtime/app_config');

var adapters = {
  git: require('./adapters/git')
};

module.exports = function(repositoryRoot) {
  var Adapter = adapters[appConfig.versionControlSystem];
  if (Adapter === undefined) {
    throw 'Cannot find vcs configuration for: ' + appConfig.versionControlSystem;
  }

  return new Adapter(repositoryRoot);
};
