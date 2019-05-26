var pathMatchers = require('utils/path_matchers');

describe('PathMatchers', function() {
  describe('.haveSamePath()', function() {
    it('returns true if the items have the same path', function() {
      expect((pathMatchers.haveSamePath({path: 'test/path'}, {path: 'test/path'}))).toBeTruthy();
    });

    it('returns false if the items do not have the same path', function() {
      expect((pathMatchers.haveSamePath({path: 'test/path1'}, {path: 'test/path2'}))).toBeFalsy();
    });
  });

  describe('.isCoupledWith()', function() {
    it('returns true if the item path equals the target path', function() {
      expect(pathMatchers.isCoupledWith('test/target/path', {path: 'test/target/path'})).toBeTruthy();
    });

    it('returns true if the item coupled path equals the target path', function() {
      expect(pathMatchers.isCoupledWith('test/target/path', {coupledPath: 'test/target/path'})).toBeTruthy();
    });

    it('returns false if the item coupled path or the item path do not equal the target path', function() {
      expect(pathMatchers.isCoupledWith('test/target/path', {path: 'test/path1', coupledPath: 'test/target/path1'})).toBeFalsy();
    });
  });

  describe('.areCoupled()', function() {
    it('returns true when the first item path is the same as the second item coupled path', function() {
      expect(pathMatchers.areCoupled({path: 'test/coupled/path'}, {path: 'test/target/path', coupledPath: 'test/coupled/path'})).toBeTruthy();
    });

    it('returns true when the two items have the same path', function() {
      expect(pathMatchers.areCoupled({path: 'test/path'}, {path: 'test/path'})).toBeTruthy();
    });

    it('returns false when the item paths are neither coupled nor equal', function() {
      expect(pathMatchers.areCoupled({path: 'test/path', coupledPath: 'test/coupled/path'}, {path: 'test/another/path', coupledPath: 'test/another/coupled/path'})).toBeFalsy();
    });
  });

  describe('.areCoupledWith()', function() {
    it('returns true when the two item paths are coupled and the second has the same path as the target path', function() {
      expect(pathMatchers.areCoupledWith('test/target/path', {path: 'test/coupled/path'}, {path: 'test/target/path', coupledPath: 'test/coupled/path'})).toBeTruthy();
    });

    it('returns true when the two item paths have the same path and the second is coupled with the target path', function() {
      expect(pathMatchers.areCoupledWith('test/target/path', {path: 'test/path'}, {path: 'test/path', coupledPath: 'test/target/path'})).toBeTruthy();
    });

    it('returns false when the item paths are neither coupled nor equal, and the first is not coupled or the same as the target path', function() {
      expect(pathMatchers.areCoupledWith('test/target/path', {path: 'test/path'}, {path: 'test/another/path', coupledPath: 'test/coupled/path'})).toBeFalsy();
    });
  });
});
