var arraysUtils = require('utils').arrays;

describe('utils.arrays', function() {
  describe('.arrayToFnFactory()', function() {
    it('returns an array of wrapper functions around each array item handler', function() {
      var fnFactory = arraysUtils.arrayToFnFactory([1, 2, 3, 4], function(number) { return number * number; });

      [1, 4, 9, 16].forEach(function(squaredElement, index) {
        expect(fnFactory[index]()).toEqual(squaredElement);
      });
    });
  });

  describe('arrayPairsToObject', function() {
    it('returns an object from the key-value pairs extracted from the array', function() {
      expect(arraysUtils.arrayPairsToObject(['a', 123, 'b', 456])).toEqual({
        a: 123, b: 456
      });
    });

    it('discards the last element when the array length is odd', function() {
      expect(arraysUtils.arrayPairsToObject(['a', 123, 'b', 456, 'c'])).toEqual({
        a: 123, b: 456
      });
    });
  });
});
