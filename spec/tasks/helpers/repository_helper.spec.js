var stream = require('stream');

var repositoryHelper = require_src('tasks/helpers/repository_helper');

describe('repositoryHelper', function() {
  beforeEach(function() {
    this.repository = jasmine.createSpyObj('isValidPath', ['isValidPath']);
    this.inputStream = new stream.PassThrough({objectMode: true});
  });

  describe('.validPathFilter()', function() {
    describe('when the path is relative', function() {
      it('includes only relative paths that are valid', function(done) {
        var self = this;
        this.repository.isValidPath.and.callFake(function(p) { return /^test\/valid-path\/.*/.test(p); });

        var output = [];
        this.inputStream.pipe(repositoryHelper.validPathFilter(this.repository))
        .on('data', output.push.bind(output))
        .on('end', function() {
          expect(output).toEqual([
            { id: 'file1', path: 'test/valid-path/file1' },
            { id: 'file3', path: 'test/valid-path/file3' }
          ]);
          expect(self.repository.isValidPath).toHaveBeenCalledWith('test/valid-path/file1', true);
          expect(self.repository.isValidPath).toHaveBeenCalledWith('test/invalid-path/file2', true);
          expect(self.repository.isValidPath).toHaveBeenCalledWith('test/valid-path/file3', true);
          done();
        });

        this.inputStream.write({ id: 'file1', path: 'test/valid-path/file1' });
        this.inputStream.write({ id: 'file2', path: 'test/invalid-path/file2' });
        this.inputStream.write({ id: 'file3', path: 'test/valid-path/file3' });
        this.inputStream.end();
      });
    });
  });
});
