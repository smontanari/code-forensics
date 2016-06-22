var appConfig = require('../runtime/app_config'),
    vcsConfig = require('./config');

module.exports = {
  adapter: function(repositoryRoot) {
    var Adapter = vcsConfig[appConfig.versionControlSystem];
    if (Adapter === undefined) {
      throw 'Cannot find vcs configuration for: ' + appConfig.versionControlSystem;
    }

    return new Adapter(repositoryRoot);
  }
};
