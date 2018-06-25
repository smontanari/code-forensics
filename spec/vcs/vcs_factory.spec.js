/*global require_src*/
var factory           = require_src('vcs/vcs_factory'),
    GitAdapter        = require_src('vcs/git/git_adapter'),
    SvnAdapter        = require_src('vcs/svn/svn_adapter'),
    GitLogTransformer = require_src('vcs/git/gitlog_stream_transformer'),
    SvnLogTransformer = require_src('vcs/svn/svnlog_stream_transformer'),
    command           = require_src('command');

describe('vcs factory', function() {
  beforeEach(function() {
    this.stubRepo = { rootPath: 'test/root' };
    this.stubDevInfo = { find: jasmine.createSpy() };
  });

  describe('when configured to use Git', function() {
    beforeEach(function() {
      this.appConfigStub({ versionControlSystem: 'git' });
    });

    describe('.adapter()', function() {
      it('returns a Git adapter', function() {
        expect(factory.adapter(this.stubRepo).constructor).toEqual(GitAdapter.prototype.constructor);
      });
    });

    describe('.logStreamTransformer()', function() {
      it('returns a Git log transformer', function() {
        expect(factory.logStreamTransformer(this.stubRepo, this.stubDevInfo).constructor).toEqual(GitLogTransformer.prototype.constructor);
      });
    });
  });

  describe('when configured to use Svn', function() {
    beforeEach(function() {
      this.appConfigStub({ versionControlSystem: 'subversion' });
    });

    describe('.adapter()', function() {
      it('returns a Svn adapter', function() {
        expect(factory.adapter(this.stubRepo).constructor).toEqual(SvnAdapter.prototype.constructor);
      });
    });

    describe('.logStreamTransformer()', function() {
      it('returns a Svn log transformer', function() {
        //this is necessary to stub out the call to adapter.vcsRelativePath()
        spyOn(command, 'run').and.returnValue(new Buffer('/test'));

        expect(factory.logStreamTransformer(this.stubRepo, this.stubDevInfo).constructor).toEqual(SvnLogTransformer.prototype.constructor);
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
          factory.adapter(this.stubRepo);
        }).toThrowError('Cannot find vcs support files for: cvs');
      });
    });

    describe('.logStreamTransformer()', function() {
      it('throws an error', function() {
        expect(function() {
          factory.logStreamTransformer(this.stubRepo, this.stubDevInfo);
        }).toThrowError('Cannot find vcs support files for: cvs');
      });
    });
  });
});
