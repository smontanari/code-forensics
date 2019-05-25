/*global require_src*/
global.require_src = function(path) {
  return require('../lib/' + path);
};

var _ = require('lodash');
var mtz = require('moment-timezone');

var logger    = require_src('log').Logger,
    appConfig = require_src('runtime/app_config');

beforeAll(function() {
  mtz.tz.setDefault('UTC');
});

afterAll(function() {
  mtz.tz.setDefault();
});

beforeEach(function() {
  _.each(['log', 'info', 'error', 'warn'], function(m) {
    spyOn(logger, m);
  });

  this.appConfigStub = function(config) {
    spyOn(appConfig, 'get').and.callFake(function(property) {
      return _.get(config, property);
    });
  };
});
