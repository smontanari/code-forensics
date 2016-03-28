global.require_src = function(path) {
  return require('../lib/' + path);
};

var utils = require_src('utils');

beforeEach(function() {
  spyOn(utils, 'log');
});
