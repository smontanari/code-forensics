/*global require_src*/
var fs     = require('fs'),
    stream = require('stream');

var json = require_src('utils').json;

describe('utils.json', function() {
  describe('.fileToObject()', function() {
    beforeEach(function() {
      spyOn(fs, 'readFile').and.callFake(function(file, callback) {
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
    beforeEach(function() {
      this.input = new stream.PassThrough();
      spyOn(fs, 'createReadStream').and.returnValue(this.input);
    });

    it('returns a stream of objects from the json array file', function(done) {
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

      this.input.write('[{"a": 123},{"a": 456, "b": {"c": "test"}}]');
      this.input.end();
    });

    it('returns a stream of objects from the json object property file', function(done) {
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

      this.input.write('{ "properties": [{"a": 123},{"a": 456, "b": {"c": "test"}}]');
      this.input.end();
    });
  });

  describe('.objectToFile', function() {
    it('writes json to a file', function() {
      spyOn(fs, 'writeFile').and.callFake(function(file, data, cb) { cb(); });

      return json.objectToFile('test/file', {obj: {a: 123, b: 'zxc'}}).then(function() {
        expect(fs.writeFile).toHaveBeenCalledWith('test/file', '{\n  "obj": {\n    "a": 123,\n    "b": "zxc"\n  }\n}', jasmine.any(Function));
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
      json.objectArrayToFileStream('test/path', input)
      .on('finish', function() {
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

      json.objectToFileStream('test/path', input).on('finish', function() {
        expect(output.toString()).toEqual('{\n  "obj": {\n    "a": 123,\n    "b": "zxc"\n  }\n}\n');
        done();
      });

      input.write({obj: {a: 123, b: 'zxc'}});
      input.end();
    });
  });
});
