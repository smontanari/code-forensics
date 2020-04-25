var fs       = require('fs'),
    Bluebird = require('bluebird'),
    stream   = require('stream');

var json = require('utils').json;
jest.mock('fs');

describe('utils.json', function() {
  describe('.fileToObject()', function() {
    beforeEach(function() {
      fs.readFile.mockImplementation(function(_file, callback) {
        callback(null, new Buffer('{"object": [{"a": 123},{"a": 456, "b": {"c": "test"}}]}'));
      });
    });

    it('reads and parses the json file', function() {
      return json.fileToObject('test/file').then(function(content) {
        expect(content).toEqual({
          object: [
            { a: 123 },
            { a: 456, b: { c: 'test' } }
          ]
        });
      });
    });
  });

  describe('.fileToObjectStream()', function() {
    var input;
    beforeEach(function() {
      input = new stream.PassThrough();
      fs.createReadStream.mockReturnValue(input);
    });

    it('returns a stream of objects from the json array file', function() {
      return new Bluebird(function(done) {
        var data = [];
        json.fileToObjectStream('test/file')
          .on('data', function(content) { data.push(content); })
          .once('end', function() {
            expect(data).toEqual([
              { a: 123 },
              { a: 456, b: { c: 'test' } }
            ]);
            done();
          });

        input.write('[{"a": 123},{"a": 456, "b": {"c": "test"}}]');
        input.end();
      });
    });

    it('returns a stream of objects from the json object property file', function() {
      return new Bluebird(function(done) {
        var data = [];
        json.fileToObjectStream('test/file', 'properties.*')
          .on('data', function(content) { data.push(content); })
          .once('end', function() {
            expect(data).toEqual([
              { a: 123 },
              { a: 456, b: { c: 'test' } }
            ]);
            done();
          });

        input.write('{ "properties": [{"a": 123},{"a": 456, "b": {"c": "test"}}]');
        input.end();
      });
    });
  });

  describe('.objectToFile', function() {
    it('writes json to a file', function() {
      fs.writeFile.mockImplementation(function(_file, _data, cb) { cb(); });

      return json.objectToFile('test/file', {obj: {a: 123, b: 'zxc'}}).then(function() {
        expect(fs.writeFile).toHaveBeenCalledWith(
          'test/file',
          '{\n  "obj": {\n    "a": 123,\n    "b": "zxc"\n  }\n}', expect.any(Function)
        );
      });
    });
  });

  describe('.objectArrayToFileStream()', function() {
    var output;
    beforeEach(function() {
      output = new Buffer(0);

      fs.createWriteStream.mockReturnValue(
        new stream.Writable({
          write: function(data, _enc, next) {
            output = Buffer.concat([output, data], output.length + data.length);
            next();
          }
        })
      );
    });

    it('writes a stream of objects into a file as a json array', function() {
      return new Bluebird(function(done) {
        var input = new stream.PassThrough({objectMode: true});
        json.objectArrayToFileStream('test/path', input)
        .on('finish', function() {
          expect(output.toString()).toEqual(
            '[\n{"obj":{"a":123,"b":"zxc"}},\n{"obj":{"c":456,"d":[789,"vbn"]}}\n]\n'
          );
          done();
        });

        input.write({obj: {a: 123, b: 'zxc'}});
        input.write({obj: {c: 456, d: [789, 'vbn']}});
        input.end();
      });
    });
  });

  describe('.objectToFileStream()', function() {
    var output;
    beforeEach(function() {
      output = new Buffer(0);
      fs.createWriteStream.mockReturnValue(
        new stream.Writable({
          write: function(data, _enc, next) {
            output = Buffer.concat([output, data], output.length + data.length);
            next();
          }
        })
      );
    });

    it('writes an object from a stream into a file as json', function() {
      return new Bluebird(function(done) {
        var input = new stream.PassThrough({objectMode: true});

        json.objectToFileStream('test/path', input).on('finish', function() {
          expect(output.toString()).toEqual(
            '{\n  "obj": {\n    "a": 123,\n    "b": "zxc"\n  }\n}\n'
          );
          done();
        });

        input.write({obj: {a: 123, b: 'zxc'}});
        input.end();
      });
    });
  });
});
