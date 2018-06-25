/*global require_src*/
var glob = require("glob");

var Repository        = require_src('models/repository'),
    repositoryPath    = require_src('models/repository_path'),
    languages         = require_src('models/language_definitions'),
    CFValidationError = require_src('models/validation_error'),
    utils             = require_src('utils');

describe('Repository', function() {
  describe('with invalid configuration', function() {
    it('throws an error if the root path is not defined', function() {
      expect(function() {
        new Repository();
      }).toThrowError(CFValidationError, 'Missing required repository configuration property: rootPath');
    });

    it('throws an error if the root path does not exist', function() {
      spyOn(utils.fileSystem, 'isDirectory').and.returnValue(false);

      expect(function() {
        new Repository({ rootPath: '/wrong/path' });
      }).toThrowError('Repository root directory does not exist: /wrong/path');

      expect(utils.fileSystem.isDirectory).toHaveBeenCalledWith('/wrong/path');
    });
  });

  describe('with valid configuration', function() {
    beforeEach(function() {
      spyOn(utils.fileSystem, 'isDirectory').and.returnValue(true);
    });

    describe('.allFiles()', function() {
      describe('with no include and exclude paths', function() {
        it('returns all the files under the root directory', function() {
          spyOn(repositoryPath, 'expand').and.returnValues(
            ['/root/path/file1', '/root/path/file3'],
            []
          );

          var subject = new Repository({ rootPath: '/root/path' });

          expect(subject.allFiles()).toEqual([
            { absolutePath: '/root/path/file1', relativePath: 'file1' },
            { absolutePath: '/root/path/file3', relativePath: 'file3' }
          ]);

          expect(repositoryPath.expand).toHaveBeenCalledWith(['/root/path/**/*'], glob.sync);
          expect(repositoryPath.expand).toHaveBeenCalledWith([], glob.sync);
        });
      });

      describe('with given include and exclude paths', function() {
        beforeEach(function() {
          spyOn(repositoryPath, 'normalise').and.returnValues('test/normalise/include', 'test/normalise/exclude');
          spyOn(repositoryPath, 'expand').and.returnValues(
            ['/root/path/file1', '/root/path/file2', '/root/path/file3', '/root/path/file4'],
            ['/root/path/file2', '/root/path/file4']
          );

          this.subject = new Repository({
            rootPath: '/root/path',
            includePaths: 'some/paths',
            excludePaths: 'some/other/paths'
          });
        });

        it('returns all the included files with absolute and relative paths', function() {
          expect(this.subject.allFiles()).toEqual([
            { absolutePath: '/root/path/file1', relativePath: 'file1' },
            { absolutePath: '/root/path/file3', relativePath: 'file3' }
          ]);

          expect(repositoryPath.expand).toHaveBeenCalledWith('test/normalise/include', glob.sync);
          expect(repositoryPath.expand).toHaveBeenCalledWith('test/normalise/exclude', glob.sync);
        });
      });
    });

    describe('.isValidPath()', function() {
      describe('with no include and exclude paths', function() {
        beforeEach(function() {
          this.subject = new Repository({ rootPath: '/root/path' });
        });

        it('returns true for any absolute path under the root directory', function() {
          expect(this.subject.isValidPath('/root/path/file1')).toBe(true);
        });

        it('returns false for any absolute path not under the root directory', function() {
          expect(this.subject.isValidPath('/another_root/path/dir1/file3.ext')).toBe(false);
        });

        it('returns true for any relative path', function() {
          expect(this.subject.isValidPath('any_folder/any_subfolder/anyFile.ext')).toBe(true);
        });
      });

      describe('with given exclude paths', function() {
        beforeEach(function() {
          this.subject = new Repository({
            rootPath: '/root/path',
            excludePaths: ['some/invalid/paths', 'other/invalid/paths/**/*', 'files/**/*.invalid']
          });
        });

        it('returns false for paths matching the exclude expressions', function() {
          expect(this.subject.isValidPath('/root/path/some/invalid/paths/file1')).toBe(false);
          expect(this.subject.isValidPath('some/invalid/paths/file3')).toBe(false);
          expect(this.subject.isValidPath('other/invalid/paths/dir1/file4.ext')).toBe(false);
          expect(this.subject.isValidPath('files/dir1/dir2/file5.invalid')).toBe(false);
        });

        it('returns true for paths not included in the exclude paths', function() {
          expect(this.subject.isValidPath('/root/path/some/unincluded/path/file2')).toBe(true);
        });

        it('returns false for any absolute path not under the root directory', function() {
          expect(this.subject.isValidPath('/another_root/path/dir1/file3.ext')).toBe(false);
        });
      });

      describe('with given include paths', function() {
        beforeEach(function() {
          this.subject = new Repository({
            rootPath: '/root/path',
            includePaths: ['some/valid/paths', 'other/valid/paths/**/*', 'files/**/*.valid']
          });
        });

        it('returns true for paths matching the include expressions', function() {
          expect(this.subject.isValidPath('/root/path/some/valid/paths/file1')).toBe(true);
          expect(this.subject.isValidPath('some/valid/paths/file2')).toBe(true);
          expect(this.subject.isValidPath('other/valid/paths/dir1/file3.ext')).toBe(true);
          expect(this.subject.isValidPath('files/dir1/dir2/file4.valid')).toBe(true);
        });

        it('returns false for paths not matching the include expressions', function() {
          expect(this.subject.isValidPath('some/invalid/paths/file3')).toBe(false);
          expect(this.subject.isValidPath('/root/path/some/invalid/paths/file1')).toBe(false);
          expect(this.subject.isValidPath('/root/path/some/unincluded/path/file2')).toBe(false);
          expect(this.subject.isValidPath('other/invalid/paths/dir1/file4.ext')).toBe(false);
          expect(this.subject.isValidPath('files/dir1/dir2/file5.invalid')).toBe(false);
        });

        it('returns false for any absolute path not under the root directory', function() {
          expect(this.subject.isValidPath('/another_root/path/dir1/file3.ext')).toBe(false);
        });
      });
    });

    describe('.fileExists()', function() {
      beforeEach(function() {
        this.subject = new Repository({ rootPath: '/some/path' });

        spyOn(this.subject, 'allFiles').and.returnValue([
          { relativePath: 'test/valid-path/file1' },
          { relativePath: 'test/valid-path/file3' }
        ]);
      });

      it('is a valid path only if it matches one of the files relative paths', function() {
        expect(this.subject.fileExists('test/valid-path/file1')).toBe(true);
        expect(this.subject.fileExists('test/valid-path/file3')).toBe(true);
        expect(this.subject.fileExists('test/invalid-path/file2')).toBe(false);
      });
    });

    describe('.sourceFiles()', function() {
      beforeEach(function() {
        spyOn(languages, 'getDefinition').and.returnValue(['py']);
        this.subject = new Repository({ rootPath: '/some/path' });
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
});
