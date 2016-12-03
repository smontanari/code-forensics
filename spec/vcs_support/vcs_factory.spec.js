var factory           = require_src('vcs_support/vcs_factory'),
    GitAdapter        = require_src('vcs_support/git/git_adapter'),
    GitLogTransformer = require_src('vcs_support/git/gitlog_stream_transformer');

describe('vcs factory', function() {
  describe('when configured to use Git', function() {
    beforeEach(function() {
      this.appConfigStub({ versionControlSystem: 'git' });
    });

    describe('.adapter()', function() {
      it('returns a Git adapter', function() {
        expect(factory.adapter({ rootPath: 'test/root' }).constructor).toEqual(GitAdapter.prototype.constructor);
      });
    });

    describe('./logStreamTransformer()', function() {
      it('returns a Git log transformer', function() {
        expect(factory.logStreamTransformer().constructor).toEqual(GitLogTransformer.prototype.constructor);
      });
    });
  });

  describe('when configured to use an unsupported repository', function() {
    beforeEach(function() {
      this.appConfigStub({ versionControlSystem: 'cvs' });
    });

    describe('.adapter()', function() {
      it('throws an error', function() {
        expect(function() {
          factory.adapter({ rootPath: 'test/root' });
        }).toThrow('Cannot find vcs support files for: cvs');
      });
    });

    describe('.logStreamTransformer()', function() {
      it('throws an error', function() {
        expect(function() {
          factory.logStreamTransformer();
        }).toThrow('Cannot find vcs support files for: cvs');
      });
    });
  });
});
