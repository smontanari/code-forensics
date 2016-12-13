global.require_src = function(path) {
  return require('../lib/' + path);
};

var _ = require('lodash');

var logger    = require_src('log').Logger,
    appConfig = require_src('runtime/app_config');

beforeEach(function() {
  spyOn(logger, 'log');
  spyOn(logger, 'info');
  spyOn(logger, 'error');

  this.appConfigStub = function(config) {
    spyOn(appConfig, 'get').and.callFake(function(property) {
      return _.get(config, property);
    });
  };
});
