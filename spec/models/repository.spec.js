var glob = require('glob');

var Repository        = require('models/repository'),
    repositoryPath    = require('models/repository_path'),
    languages         = require('models/language_definitions'),
    CFValidationError = require('runtime/errors').CFValidationError,
    utils             = require('utils');

describe('Repository', function() {
  beforeEach(function() {
    utils.fileSystem.isDirectory = jest.fn();
  });

  describe('with invalid configuration', function() {
    it('throws an error if the root path is not defined', function() {
      expect(function() {
        new Repository();
      }).toThrow(CFValidationError, 'Missing required repository configuration property: rootPath');
    });

    it('throws an error if the root path does not exist', function() {
      utils.fileSystem.isDirectory.mockReturnValue(false);

      expect(function() {
        new Repository({ rootPath: '/wrong/path' });
      }).toThrow('Repository root directory does not exist: /wrong/path');

      expect(utils.fileSystem.isDirectory).toHaveBeenCalledWith('/wrong/path');
    });
  });

  describe('with valid configuration', function() {
    var subject;
    beforeEach(function() {
      utils.fileSystem.isDirectory.mockReturnValue(true);
    });

    describe('.allFiles()', function() {
      beforeEach(function() {
        repositoryPath.expand = jest.fn();
      });

      describe('with no include and exclude paths', function() {
        it('returns all the files under the root directory', function() {
          repositoryPath.expand
            .mockReturnValueOnce(['/root/path/file1', '/root/path/file3'])
            .mockReturnValueOnce([]);

          var subject = new Repository({ rootPath: '/root/path' });

          expect(subject.allFiles()).toEqual([
            { absolutePath: '/root/path/file1', relativePath: 'file1' },
            { absolutePath: '/root/path/file3', relativePath: 'file3' }
          ]);

          expect(repositoryPath.expand).toHaveBeenNthCalledWith(1, ['/root/path/**/*'], glob.sync);
          expect(repositoryPath.expand).toHaveBeenNthCalledWith(2, [], glob.sync);
        });
      });

      describe('with given include and exclude paths', function() {
        beforeEach(function() {
          jest.spyOn(repositoryPath, 'normalise')
            .mockReturnValueOnce('test/normalise/include')
            .mockReturnValueOnce('test/normalise/exclude');
          repositoryPath.expand
            .mockReturnValueOnce(['/root/path/file1', '/root/path/file2', '/root/path/file3', '/root/path/file4'])
            .mockReturnValueOnce(['/root/path/file2', '/root/path/file4']);
        });

        it('returns all the included files with absolute and relative paths', function() {
          var subject = new Repository({
            rootPath: '/root/path',
            includePaths: 'some/paths',
            excludePaths: 'some/other/paths'
          });

          expect(subject.allFiles()).toEqual([
            { absolutePath: '/root/path/file1', relativePath: 'file1' },
            { absolutePath: '/root/path/file3', relativePath: 'file3' }
          ]);

          expect(repositoryPath.expand).toHaveBeenNthCalledWith(1, 'test/normalise/include', glob.sync);
          expect(repositoryPath.expand).toHaveBeenNthCalledWith(2, 'test/normalise/exclude', glob.sync);
        });
      });
    });

    describe('.isValidPath()', function() {
      describe('with no include and exclude paths', function() {
        beforeEach(function() {
          subject = new Repository({ rootPath: '/root/path' });
        });

        it('returns true for any absolute path under the root directory', function() {
          expect(subject.isValidPath('/root/path/file1')).toBe(true);
        });

        it('returns false for any absolute path not under the root directory', function() {
          expect(subject.isValidPath('/another_root/path/dir1/file3.ext')).toBe(false);
        });

        it('returns true for any relative path', function() {
          expect(subject.isValidPath('any_folder/any_subfolder/anyFile.ext')).toBe(true);
        });
      });

      describe('with given exclude paths', function() {
        beforeEach(function() {
          subject = new Repository({
            rootPath: '/root/path',
            excludePaths: ['some/invalid/paths', 'other/invalid/paths/**/*', 'files/**/*.invalid']
          });
        });

        it('returns false for paths matching the exclude expressions', function() {
          expect(subject.isValidPath('/root/path/some/invalid/paths/file1')).toBe(false);
          expect(subject.isValidPath('some/invalid/paths/file3')).toBe(false);
          expect(subject.isValidPath('other/invalid/paths/dir1/file4.ext')).toBe(false);
          expect(subject.isValidPath('files/dir1/dir2/file5.invalid')).toBe(false);
        });

        it('returns true for paths not included in the exclude paths', function() {
          expect(subject.isValidPath('/root/path/some/unincluded/path/file2')).toBe(true);
        });

        it('returns false for any absolute path not under the root directory', function() {
          expect(subject.isValidPath('/another_root/path/dir1/file3.ext')).toBe(false);
        });
      });

      describe('with given include paths', function() {
        beforeEach(function() {
          subject = new Repository({
            rootPath: '/root/path',
            includePaths: ['some/valid/paths', 'other/valid/paths/**/*', 'files/**/*.valid']
          });
        });

        it('returns true for paths matching the include expressions', function() {
          expect(subject.isValidPath('/root/path/some/valid/paths/file1')).toBe(true);
          expect(subject.isValidPath('some/valid/paths/file2')).toBe(true);
          expect(subject.isValidPath('other/valid/paths/dir1/file3.ext')).toBe(true);
          expect(subject.isValidPath('files/dir1/dir2/file4.valid')).toBe(true);
        });

        it('returns false for paths not matching the include expressions', function() {
          expect(subject.isValidPath('some/invalid/paths/file3')).toBe(false);
          expect(subject.isValidPath('/root/path/some/invalid/paths/file1')).toBe(false);
          expect(subject.isValidPath('/root/path/some/unincluded/path/file2')).toBe(false);
          expect(subject.isValidPath('other/invalid/paths/dir1/file4.ext')).toBe(false);
          expect(subject.isValidPath('files/dir1/dir2/file5.invalid')).toBe(false);
        });

        it('returns false for any absolute path not under the root directory', function() {
          expect(subject.isValidPath('/another_root/path/dir1/file3.ext')).toBe(false);
        });
      });
    });

    describe('.fileExists()', function() {
      beforeEach(function() {
        subject = new Repository({ rootPath: '/some/path' });

        subject.allFiles = jest.fn().mockReturnValue([
          { relativePath: 'test/valid-path/file1' },
          { relativePath: 'test/valid-path/file3' }
        ]);
      });

      it('is a valid path only if it matches one of the files relative paths', function() {
        expect(subject.fileExists('test/valid-path/file1')).toBe(true);
        expect(subject.fileExists('test/valid-path/file3')).toBe(true);
        expect(subject.fileExists('test/invalid-path/file2')).toBe(false);
      });
    });

    describe('.sourceFiles()', function() {
      beforeEach(function() {
        languages.getDefinition = jest.fn().mockReturnValue(['py']);

        subject = new Repository({ rootPath: '/some/path' });
        subject.allFiles = jest.fn().mockReturnValue([
          { absolutePath: '/root/test/file1.js', relativePath: 'test/file1.js' },
          { absolutePath: '/root/test/file3.py', relativePath: 'test/file3.py' },
          { absolutePath: '/root/test/file4.rb', relativePath: 'test/file4.rb' },
          { absolutePath: '/root/test/file5.py', relativePath: 'test/file5.py' },
          { absolutePath: '/root/test/file6.js', relativePath: 'test/file6.js' }
        ]);
      });

      it('returns all source code files for each defined language', function() {
        expect(subject.sourceFiles('python')).toEqual([
          { absolutePath: '/root/test/file3.py', relativePath: 'test/file3.py' },
          { absolutePath: '/root/test/file5.py', relativePath: 'test/file5.py' }
        ]);

        expect(languages.getDefinition).toHaveBeenCalledWith('python');
      });
    });
  });
});
