// var fs = require('fs');

var fsUtils = require('utils').fileSystem;

// jest.mock('fs');
var fs;
jest.isolateModules(function() {
  fs = require('fs');
});
jest.mock('fs');

describe('utils.fileSystem', function() {
  var mockStat;
  beforeEach(function() {
    mockStat = {
      isFile: jest.fn(),
      isDirectory: jest.fn()
    };
    fs.existsSync = jest.fn();
    fs.statSync.mockReturnValue(mockStat);
  });

  describe.each([
    ['isFile'], ['isDirectory']
  ])('Verify path', function(query) {
    it('returns true for an existing and valid path', function() {
      fs.existsSync.mockReturnValue(true);
      mockStat[query].mockReturnValue(true);

      expect(fsUtils[query]('test-path')).toBe(true);
    });

    it('returns false for a non existing path', function() {
      fs.existsSync.mockReturnValue(false);
      expect(fsUtils[query]('test-path')).toBe(false);
    });

    it('returns false for an existing but invalid path', function() {
      fs.existsSync.mockReturnValue(true);
      mockStat[query].mockReturnValue(false);
      expect(fsUtils[query]('test-path')).toBe(false);
    });
  });
});
