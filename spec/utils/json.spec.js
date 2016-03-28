var fs     = require('fs'),
    stream = require('stream');

var json = require_src('utils').json;

describe('utils/json', function() {
  describe('.parseFile()', function() {
    beforeEach(function() {
      spyOn(fs, 'readFile').and.callFake(function(file, callback) {
        callback(null, new Buffer('{"object": [{"a": 123},{"a": 456, "b": {"c": "test"}}]}'));
      });
    });

    it('reads and parses the json file', function(done) {
      json.parseFile('test/file').then(function(content) {
        expect(content).toEqual({
          object: [
            { a: 123 },
            { a: 456, b: { c: 'test' } }
          ]
        });
        done();
      });
    });
  });

  describe('.objectArrayToFileStream()', function() {
    var output;
    beforeEach(function() {
      output = new Buffer(0);
      spyOn(fs, 'createWriteStream').and.returnValue(
        new stream.Writable({
          write: function(data, enc, next) {
            output = Buffer.concat([output, data], output.length + data.length);
            next();
          }
        })
      );
    });

    it('writes a stream of objects into a file as a json array', function(done) {
      var input = new stream.PassThrough({objectMode: true});

      input.pipe(json.objectArrayToFileStream('test/path'))
      .on('end', function() {
        expect(output.toString()).toEqual('[\n{"obj":{"a":123,"b":"zxc"}},\n{"obj":{"c":456,"d":[789,"vbn"]}}\n]\n');
        done();
      });

      input.write({obj: {a: 123, b: 'zxc'}});
      input.write({obj: {c: 456, d: [789, 'vbn']}});
      input.end();
    });
  });

  describe('.objectToFileStream()', function() {
    var output;
    beforeEach(function() {
      output = new Buffer(0);
      spyOn(fs, 'createWriteStream').and.returnValue(
        new stream.Writable({
          write: function(data, enc, next) {
            output = Buffer.concat([output, data], output.length + data.length);
            next();
          }
        })
      );
    });

    it('writes an object from a stream into a file as json', function(done) {
      var input = new stream.PassThrough({objectMode: true});

      input.pipe(json.objectToFileStream('test/path'))
      .on('end', function() {
        expect(output.toString()).toEqual('{\n  "obj": {\n    "a": 123,\n    "b": "zxc"\n  }\n}\n');
        done();
      });

      input.write({obj: {a: 123, b: 'zxc'}});
      input.end();
    });
  });
});
