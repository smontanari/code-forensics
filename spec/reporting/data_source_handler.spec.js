var _        = require('lodash'),
    stream   = require('stream'),
    Bluebird = require('bluebird');

var DataSourceHandler = require('reporting/data_source_handler'),
    utils             = require('utils');

describe('DataSourceHandler', function() {
  var subject;
  beforeEach(function() {
    subject = DataSourceHandler.instance();
  });

  it('returns data from an array object', function() {
    return expect(subject.processDataSource([{ a: 123, b: 'zxc' }, { a: 456, b: 'vbn' }]))
      .resolves.toEqual([
        { a: 123, b: 'zxc' },
        { a: 456, b: 'vbn' }
      ]);
  });

  it('returns data from a json file', function() {
    utils.fileSystem.isFile = jest.fn().mockReturnValue(true);
    utils.json.fileToObject = jest.fn().mockResolvedValue([
      { a: 123, b: 'zxc' },
      { a: 456, b: 'vbn' }
    ]);

    return subject.processDataSource('test/file.json')
      .then(function(data) {
        expect(data).toEqual([
          { a: 123, b: 'zxc' },
          { a: 456, b: 'vbn' }
        ]);

        expect(utils.fileSystem.isFile).toHaveBeenCalledWith(
          'test/file.json'
        );

        expect(utils.json.fileToObject).toHaveBeenCalledWith(
          'test/file.json'
        );
      });
  });

  it('returns data from an object stream', function() {
    return new Bluebird(function(done) {
      var inputStream = new stream.PassThrough({ objectMode: true });
      subject.processDataSource(inputStream)
        .then(function(data) {
          expect(data).toEqual([
            { a: 123, b: 'zxc' },
            { a: 456, b: 'vbn' }
          ]);
          done();
        })
        .catch(done.fail);

      inputStream.write({ a: 123, b: 'zxc' });
      inputStream.write({ a: 456, b: 'vbn' });
      inputStream.end();
    });
  });

  it('returns data from a generated object stream', function() {
    return new Bluebird(function(done) {
      var inputStream = new stream.PassThrough({ objectMode: true });
      subject.processDataSource(function() { return inputStream; })
        .then(function(data) {
          expect(data).toEqual([
            { a: 123, b: 'zxc' },
            { a: 456, b: 'vbn' }
          ]);
          done();
        })
        .catch(done.fail);

      inputStream.write({ a: 123, b: 'zxc' });
      inputStream.write({ a: 456, b: 'vbn' });
      inputStream.end();
    });
  });

  it('returns data from a promise generating an object stream', function() {
    return new Bluebird(function(done) {
      var inputStream = new stream.PassThrough({ objectMode: true });
      subject.processDataSource(jest.fn().mockResolvedValue(inputStream))
        .then(function(data) {
          expect(data).toEqual([{ a: 123, b: 'zxc' }, { a: 456, b: 'vbn' }]);
          done();
        })
        .catch(done.fail);

      inputStream.write({ a: 123, b: 'zxc' });
      inputStream.write({ a: 456, b: 'vbn' });
      inputStream.end();
    });
  });

  it('fails if the data source has an error ', function() {
    return new Bluebird(function(done) {
      var inputStream = new stream.PassThrough({ objectMode: true });

      subject.processDataSource(inputStream)
        .catch(function(err) {
          expect(err.message).toEqual('woopsie doopsie');
          done();
        });

      _.delay(function() {
        inputStream.push({ a: 123, b: 'zxc' });
        inputStream.emit('error', new Error('woopsie doopsie'));
      }, 100);
    });
  });
});
