var _    = require('lodash'),
    Path = require('path'),
    glob = require("glob");

var RepositoryConfiguration = require_src('runtime/repository').RepositoryConfiguration,
    repositoryPath          = require_src('runtime/repository_path');
    languages               = require_src('runtime/language_definitions');

describe('RepositoryConfiguration', function() {
  it('resolves the root path', function() {
    spyOn(Path, 'resolve').and.returnValue('actual/path');

    this.subject = new RepositoryConfiguration({root: '/some/path'});

    expect(this.subject.root).toEqual('actual/path');
  });

  it('returns all the included filenames', function() {
    spyOn(repositoryPath, 'normalise').and.callFake(function(root, paths) {
      if (paths == 'some/paths') { return ['file1', 'file2', 'file3', 'file4']; }
      if (paths == 'some/other/paths') { return ['file2', 'file4']; }
    });
    spyOn(glob, 'sync').and.callFake(_.identity);

    this.subject = new RepositoryConfiguration({
      root: '/root/path',
      paths: 'some/paths',
      exclude: 'some/other/paths'
    });

    expect(this.subject.allFilenames()).toEqual(['file1', 'file3']);
  });

  describe('.isValidPath()', function() {
    beforeEach(function() {
      this.subject = new RepositoryConfiguration({ root: '/root/' });
      spyOn(this.subject, 'allFilenames').and.returnValue(['/root/all', '/root/filenames']);
    });

    it('returns true when the relative path is included', function() {
      expect(this.subject.isValidPath('all', true)).toEqual(true);
    });

    it('returns false when the relative path is not included', function() {
      expect(this.subject.isValidPath('none', true)).toEqual(false);
    });

    it('returns true when the absolute path is included', function() {
      expect(this.subject.isValidPath('/root/filenames', false)).toEqual(true);
    });

    it('returns false when the absolute path is not included', function() {
      expect(this.subject.isValidPath('/root/other/filenames', false)).toEqual(false);
    });
  });

  describe('.collectCodePaths()', function() {
    it('returns all source code files for each defined language', function() {
      spyOn(languages, 'getDefinition').and.returnValue(['py']);

      this.subject = new RepositoryConfiguration({ root: '/root/' });
      spyOn(this.subject, 'allFilenames').and.returnValue([
        'file1.js',
        'file2.txt',
        'file3.py',
        'file4.rb',
        'file5.py',
        'file6.js'
      ]);

      expect(this.subject.collectCodePaths('python')).toEqual(['file3.py', 'file5.py']);
      expect(languages.getDefinition).toHaveBeenCalledWith('python');
    });
  });
});
