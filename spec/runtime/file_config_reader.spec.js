var fs = require('fs');

var FileConfigReader = require('runtime/file_config_reader'),
    utils            = require('utils');

jest.mock('fs');

describe('FileConfigReader', function() {
  var subject;

  beforeEach(function() {
    subject = new FileConfigReader();
    utils.fileSystem.isFile = jest.fn();
  });

  describe('when no configuration file exists', function() {
    it('returns an empty object', function() {
      utils.fileSystem.isFile.mockReturnValue(false);

      expect(subject.getConfiguration()).toEqual({});
    });
  });

  describe('when a configuration file exists', function() {
    it('returns the parsed object from the json file', function() {
      utils.fileSystem.isFile.mockReturnValue(true);
      fs.readFileSync.mockReturnValue('{ "a": 1, "b": 2, "c": { "z": "qwe" } }');

      expect(subject.getConfiguration()).toEqual({ a: 1, b: 2, c: { z: 'qwe' } });
    });
  });
});
