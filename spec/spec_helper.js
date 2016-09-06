global.require_src = function(path) {
  return require('../lib/' + path);
};

var utils     = require_src('utils'),
    appConfig = require_src('runtime/app_config');

beforeEach(function() {
  spyOn(utils, 'log');

  this.appConfigStub = function(config) {
    spyOn(appConfig, 'get').and.callFake(function(property) {
      return config[property];
    });
  };
});
