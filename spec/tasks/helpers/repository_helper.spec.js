var stream = require('stream');

var repositoryHelper = require_src('tasks/helpers/repository_helper');

describe('repositoryHelper', function() {
  beforeEach(function() {
    this.repository = {
      root: '/repo-root',
      isValidPath: function(p) { return /^test\/valid-path\/.*/.test(p); }
    };
    this.inputStream = new stream.PassThrough({objectMode: true});
  });

  describe('.validPathFilter()', function() {
    it('includes only paths that are valid', function(done) {
      var output = [];
      this.inputStream.pipe(repositoryHelper.validPathFilter(this.repository))
      .on('data', output.push.bind(output))
      .on('end', function() {
        expect(output).toEqual([
          { id: 'file1', path: 'test/valid-path/file1' },
          { id: 'file3', path: 'test/valid-path/file3' }
        ]);
        done();
      })

      this.inputStream.write({ id: 'file1', path: 'test/valid-path/file1' });
      this.inputStream.write({ id: 'file2', path: 'test/invalid-path/file2' });
      this.inputStream.write({ id: 'file3', path: 'test/valid-path/file3' });
      this.inputStream.end();
    });
  });

  describe('.absolutePathMapper()', function() {
    it('converts the repo relative paths to absolute paths', function(done) {
      var output = [];
      this.inputStream.pipe(repositoryHelper.absolutePathMapper(this.repository))
      .on('data', output.push.bind(output))
      .on('end', function() {
        expect(output).toEqual([
          { id: 'file1', path: '/repo-root/test/file1' },
          { id: 'file2', path: '/repo-root/test/file2' }
        ]);
        done();
      })

      this.inputStream.write({ id: 'file1', path: 'test/file1' });
      this.inputStream.write({ id: 'file2', path: 'test/file2' });
      this.inputStream.end();
    });
  });
});
