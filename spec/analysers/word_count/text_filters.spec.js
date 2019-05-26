var textFilters = require('analysers/word_count/text_filters');

describe('TextFilters', function() {
  var rejectFn;
  describe('.createRejectFn()', function() {
    beforeEach(function() {
      rejectFn = new textFilters.createRejectFn([
        'foo',
        /bar/,
        function(text) { return text === 'baz'; }
      ]);
    });

    it("accepts words that don't match any expression", function() {
      expect(rejectFn('quz')).toBe(false);
    });

    it('rejects words matching a string blacklist expression', function() {
      expect(rejectFn('foo')).toBe(true);
    });

    it('rejects words matching a regexp blacklist expression', function() {
      expect(rejectFn('qwebarzxc')).toBe(true);
    });

    it('rejects words matching a function blacklist expression', function() {
      expect(rejectFn('baz')).toBe(true);
    });
  });
});
