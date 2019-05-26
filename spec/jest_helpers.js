var _ = require('lodash');
var appConfig = require('runtime/app_config');

module.exports = {
  appConfigStub: function(config) {
    jest.spyOn(appConfig, 'get').mockImplementation(function(property) {
      return _.get(config, property);
    });
  },
  appConfigRestore: function() {
    appConfig.get.mockRestore();
  }
};
