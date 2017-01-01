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

          this.subject = new Repository({ rootPath: '/root/path' });

          expect(this.subject.allFiles()).toEqual([
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
      beforeEach(function() {
        this.subject = new Repository({ rootPath: '/some/path' });

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
