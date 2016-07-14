var stream = require('stream');

var repositoryHelper = require_src('tasks/helpers/repository_helper'),
    languages        = require_src('runtime/language_definitions');

describe('repositoryHelper', function() {
  describe('.validPathFilter()', function() {
    beforeEach(function() {
      this.repository = {
        allFiles: function() {
          return [
            { relativePath: 'test/valid-path/file1' },
            { relativePath: 'test/valid-path/file3' }
          ];
        }
      };
      this.inputStream = new stream.PassThrough({objectMode: true});
    });

    it('includes only relative paths that are valid', function(done) {
      var output = [];
      this.inputStream.pipe(repositoryHelper.validPathFilter(this.repository))
      .on('data', output.push.bind(output))
      .on('end', function() {
        expect(output).toEqual([
          { id: 'file1', path: 'test/valid-path/file1' },
          { id: 'file3', path: 'test/valid-path/file3' }
        ]);
        done();
      });

      this.inputStream.write({ id: 'file1', path: 'test/valid-path/file1' });
      this.inputStream.write({ id: 'file2', path: 'test/invalid-path/file2' });
      this.inputStream.write({ id: 'file3', path: 'test/valid-path/file3' });
      this.inputStream.end();
    });
  });

  describe('.codeFiles()', function() {
    beforeEach(function() {
      spyOn(languages, 'getDefinition').and.returnValue(['py']);
      this.repository = {
        allFiles: function() {
          return [
            { absolutePath: '/root/test/file1.js', relativePath: 'test/file1.js' },
            { absolutePath: '/root/test/file3.py', relativePath: 'test/file3.py' },
            { absolutePath: '/root/test/file4.rb', relativePath: 'test/file4.rb' },
            { absolutePath: '/root/test/file5.py', relativePath: 'test/file5.py' },
            { absolutePath: '/root/test/file6.js', relativePath: 'test/file6.js' }
          ];
        }
      };
    });

    it('returns all source code files for each defined language', function() {
      expect(repositoryHelper.codeFiles(this.repository, 'python')).toEqual([
        { absolutePath: '/root/test/file3.py', relativePath: 'test/file3.py' },
        { absolutePath: '/root/test/file5.py', relativePath: 'test/file5.py' }
      ]);
      expect(languages.getDefinition).toHaveBeenCalledWith('python');
    });
  });
});
