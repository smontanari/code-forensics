var fs = require('fs');

var repositoryPath = require_src('models/repository_path');

describe('repositoryPath', function() {
  beforeEach(function() {
    spyOn(fs, 'statSync');
    spyOn(fs, 'existsSync');
  });

  describe('.makeGlob()', function() {
    describe('for a glob path', function() {
      it('returns the path itself', function() {
        expect(repositoryPath.makeGlob('/some/glob/**/*.path')).toEqual('/some/glob/**/*.path');
      });
    });

    describe('for a file path', function() {
      it('returns the path itself', function() {
        fs.existsSync.and.returnValue(true);
        fs.statSync.and.returnValue({ isDirectory: function() { return false; }});

        expect(repositoryPath.makeGlob('/some/file.path')).toEqual('/some/file.path');
        expect(fs.statSync).toHaveBeenCalledWith('/some/file.path');
      });
    });

    describe('for a directory path', function() {
      it('returns glob for all files in the directory', function() {
        fs.existsSync.and.returnValue(true);
        fs.statSync.and.returnValue({ isDirectory: function() { return true; }});

        expect(repositoryPath.makeGlob('/some/dir/path')).toEqual('/some/dir/path/**/*');
        expect(fs.statSync).toHaveBeenCalledWith('/some/dir/path');
      });
    });
  });

  describe('.expand()', function() {
    it('return the expanded list of paths', function() {
      fs.existsSync.and.returnValue(true);
      fs.statSync.and.callFake(function(name) {
        var isDir = (/folder$/).test(name);
        return { isFile: function() { return !isDir; } };
      });

      var expander = function(pathExpr) {
        return [
          pathExpr + '/some/file',
          pathExpr + '/some/folder',
          pathExpr + '/some/folder/file'
        ];
      };

      expect(repositoryPath.expand(['/dir1', '/dir2'], expander)).toEqual([
        '/dir1/some/file',
        '/dir1/some/folder/file',
        '/dir2/some/file',
        '/dir2/some/folder/file'
      ]);
    });
  });

  describe('.normalise()', function() {
    it('returns the normalised paths', function() {
      fs.existsSync.and.returnValue(true);
      fs.statSync.and.returnValue({ isDirectory: function() { return true; }});

      expect(repositoryPath.normalise('/test/root', ['some/path/*', 'another/path/'])).toEqual([
        '/test/root/some/path/*',
        '/test/root/another/path/**/*'
      ]);
    });
  });

  describe('.relativise()', function() {
    it('returns the same path when it does not begin with the root', function() {
      expect(repositoryPath.relativise('/test/root', 'root/some/path')).toEqual('root/some/path');
    });

    it('returns the path as relative to the root path', function() {
      expect(repositoryPath.relativise('/test/root/', '/test/root/some/path')).toEqual('some/path');
    });
  });
});
