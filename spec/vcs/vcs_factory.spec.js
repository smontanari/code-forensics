var factory           = require('vcs/vcs_factory'),
    GitAdapter        = require('vcs/git/git_adapter'),
    SvnAdapter        = require('vcs/svn/svn_adapter'),
    GitLogTransformer = require('vcs/git/gitlog_stream_transformer'),
    SvnLogTransformer = require('vcs/svn/svnlog_stream_transformer');

var helpers = require('../jest_helpers');

jest.mock('vcs/git/git_adapter');
jest.mock('vcs/svn/svn_adapter');
jest.mock('vcs/git/gitlog_stream_transformer');
jest.mock('vcs/svn/svnlog_stream_transformer');

describe('vcs factory', function() {
  describe.each([
    ['git', GitAdapter, GitLogTransformer],
    ['subversion', SvnAdapter, SvnLogTransformer]
  ])('Supported VCS', function(vcsType, adapter, logTransformer) {
    describe('when configured to use ' + vcsType, function() {
      beforeEach(function() {
        helpers.appConfigStub({ versionControlSystem: vcsType });
        adapter.mockImplementation(function() { return { adapter: 'test-adapter'}; });
        logTransformer.mockImplementation(function() { return { transformer: 'test-transformer'}; });
      });

      afterEach(function() {
        helpers.appConfigRestore();
      });

      it('returns a ' + vcsType + ' adapter', function() {
        expect(factory.adapter('test-repo')).toEqual({ adapter: 'test-adapter'});
        expect(adapter).toHaveBeenCalledWith('test-repo');
      });

      it('returns a ' + vcsType + ' log transformer', function() {
        expect(factory.logStreamTransformer('test-repo', 'test-dev-info')).toEqual({ transformer: 'test-transformer'});
        expect(logTransformer).toHaveBeenCalledWith('test-repo', 'test-dev-info', { adapter: 'test-adapter'});
      });
    });
  });

  describe('Unsupported VCS', function() {
    beforeEach(function() {
      helpers.appConfigStub({ versionControlSystem: 'cvs' });
    });

    afterEach(function() {
      helpers.appConfigRestore();
    });

    it.each([
      ['adapter', ['test-repo']],
      ['logStreamTransformer', ['test-repo', 'test-dev-info']]
    ])('throws an error', function(factoryMethod, args) {
      expect(function() {
        factory[factoryMethod].apply(factory, args);
      }).toThrow('Cannot find vcs support files for: cvs');
    });
  });
});
