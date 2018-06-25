/*global require_src*/
var fsUtils = require_src('utils').fileSystem;

describe('utils.fileSystem', function() {
  describe('.isFile()', function() {
    it('returns true for a valid file', function() {
      expect(fsUtils.isFile(__filename)).toBe(true);
    });

    it('returns false for a non valid file', function() {
      expect(fsUtils.isFile('file_that_doesnot_exist')).toBe(false);
    });
  });

  describe('.isDirectory()', function() {
    it('returns true for a valid folder', function() {
      expect(fsUtils.isDirectory(__dirname)).toBe(true);
    });

    it('returns false for a non valid folder', function() {
      expect(fsUtils.isDirectory('dir_that_doesnot_exist')).toBe(false);
    });
  });
});
