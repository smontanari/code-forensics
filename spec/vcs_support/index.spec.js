var vcsSupport = require_src('vcs_support'),
    vcsConfig  = require_src('vcs_support/config'),
    appConfig  = require_src('runtime/app_config');

describe('.adapter()', function() {
  describe('when configured to use Git', function() {
    beforeEach(function() {
      appConfig.versionControlSystem = 'git';
      spyOn(vcsConfig, 'git').and.returnValue({ obj: 'test vcs'});
    });

    it('returns a Git adapter', function() {
      var vcs = vcsSupport.adapter('test/root');

      expect(vcs).toEqual({ obj: 'test vcs'});
      expect(vcsConfig.git).toHaveBeenCalledWith('test/root');
    });
  });

  describe('when configured to use an invalid adapter', function() {
    it('throws an error', function() {
      appConfig.versionControlSystem = 'cvs';

      expect(function() {
        vcsSupport.adapter('test/root');
      }).toThrow('Cannot find vcs configuration for: cvs');
    });
  });
});
