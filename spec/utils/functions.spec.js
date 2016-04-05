var functionUtils = require_src('utils').functions;

describe('utils.functions', function() {
  describe('.arrayToFnFactory()', function() {
    it('returns an array of wrapper functions around each array item handler', function() {
      var fnFactory = functionUtils.arrayToFnFactory([1, 2, 3, 4], function(number) { return number * number; });

      [1, 4, 9, 16].forEach(function(squaredElement, index) {
        expect(fnFactory[index]()).toEqual(squaredElement);
      });
    });
  });
});
