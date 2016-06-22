var factory = require_src('vcs_support/adapters_factory'),
    Git     = require_src('vcs_support/adapters/git'),
    appConfig  = require_src('runtime/app_config');

describe('vcs adapters factory', function() {
  describe('when configured to use Git', function() {
    beforeEach(function() {
      appConfig.versionControlSystem = 'git';
    });

    it('returns a Git adapter', function() {
      var vcs = factory('test/root');

      expect(vcs.constructor).toEqual(Git.prototype.constructor);
    });
  });

  describe('when configured to use an invalid adapter', function() {
    it('throws an error', function() {
      appConfig.versionControlSystem = 'cvs';

      expect(function() {
        factory('test/root');
      }).toThrow('Cannot find vcs configuration for: cvs');
    });
  });
});
