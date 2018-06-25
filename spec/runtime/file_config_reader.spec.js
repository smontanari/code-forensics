/*global require_src*/
var fs = require('fs');

var FileConfigReader = require_src('runtime/file_config_reader'),
    utils            = require_src('utils');

describe('FileConfigReader', function() {
  beforeEach(function() {
    this.subject = new FileConfigReader();
  });

  describe('when no configuration file exists', function() {
    it('returns an empty object', function() {
      spyOn(utils.fileSystem, 'isFile').and.returnValue(false);

      expect(this.subject.getConfiguration()).toEqual({});
    });
  });

  describe('when a configuration file exists', function() {
    it('returns the parsed object from the json file', function() {
      spyOn(utils.fileSystem, 'isFile').and.returnValue(true);
      spyOn(fs, 'readFileSync').and.returnValue('{ "a": 1, "b": 2, "c": { "z": "qwe" } }');

      expect(this.subject.getConfiguration()).toEqual({
        a: 1, b: 2, c: { z: 'qwe' }
      });
    });
  });
});
