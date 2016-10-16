var _    = require('lodash'),
    Path = require('path'),
    glob = require("glob");

var Repository     = require_src('models/repository'),
    repositoryPath = require_src('models/repository_path'),
    languages      = require_src('models/language_definitions');

describe('Repository', function() {
  describe('.rootPath', function() {
    it('resolves the root path', function() {
      spyOn(Path, 'resolve').and.returnValue('actual/path');

      this.subject = new Repository({ rootPath: '/some/path' });

      expect(this.subject.rootPath).toEqual('actual/path');
      expect(Path.resolve).toHaveBeenCalledWith('/some/path');
    });
  });

  describe('.allFiles()', function() {
    beforeEach(function() {
      spyOn(repositoryPath, 'normalise').and.callFake(function(root, paths) {
        if (paths === 'some/paths') { return ['/root/path/file1', '/root/path/file2', '/root/path/file3', '/root/path/file4']; }
        if (paths === 'some/other/paths') { return ['/root/path/file2', '/root/path/file4']; }
      });
      spyOn(glob, 'sync').and.callFake(_.identity);

      this.subject = new Repository({
        rootPath: '/root/path',
        includePaths: 'some/paths',
        excludePaths: 'some/other/paths'
      });
    });

    it('returns the all the included files with absolute and relative paths', function() {
      expect(this.subject.allFiles()).toEqual([
        { absolutePath: '/root/path/file1', relativePath: 'file1' },
        { absolutePath: '/root/path/file3', relativePath: 'file3' }
      ]);
    });
  });

  describe('.isValidPath()', function() {
    beforeEach(function() {
      this.subject = new Repository({rootPath: '/some/path'});

      spyOn(this.subject, 'allFiles').and.returnValue([
        { relativePath: 'test/valid-path/file1' },
        { relativePath: 'test/valid-path/file3' }
      ]);
    });

    it('is a valid path only if it matches one of the files relative paths', function() {
      expect(this.subject.isValidPath('test/valid-path/file1')).toBe(true);
      expect(this.subject.isValidPath('test/valid-path/file3')).toBe(true);
      expect(this.subject.isValidPath('test/invalid-path/file2')).toBe(false);
    });
  });

  describe('.sourceFiles()', function() {
    beforeEach(function() {
      spyOn(languages, 'getDefinition').and.returnValue(['py']);
      this.subject = new Repository({rootPath: '/some/path'});
      spyOn(this.subject, 'allFiles').and.returnValue([
        { absolutePath: '/root/test/file1.js', relativePath: 'test/file1.js' },
        { absolutePath: '/root/test/file3.py', relativePath: 'test/file3.py' },
        { absolutePath: '/root/test/file4.rb', relativePath: 'test/file4.rb' },
        { absolutePath: '/root/test/file5.py', relativePath: 'test/file5.py' },
        { absolutePath: '/root/test/file6.js', relativePath: 'test/file6.js' }
      ]);
    });

    it('returns all source code files for each defined language', function() {
      expect(this.subject.sourceFiles('python')).toEqual([
        { absolutePath: '/root/test/file3.py', relativePath: 'test/file3.py' },
        { absolutePath: '/root/test/file5.py', relativePath: 'test/file5.py' }
      ]);
      expect(languages.getDefinition).toHaveBeenCalledWith('python');
    });
  });
});
