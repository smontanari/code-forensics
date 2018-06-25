/*global require_src*/
var textFilters = require_src('analysers/word_count/text_filters');

describe('TextFilters', function() {
  describe('.createRejectFn()', function() {
    beforeEach(function() {
      this.rejectFn = new textFilters.createRejectFn([
        'foo',
        /bar/,
        function(text) { return text === 'baz'; }
      ]);
    });

    it("accepts words that don't match any expression", function() {
      expect(this.rejectFn('quz')).toBe(false);
    });

    it('rejects words matching a string blacklist expression', function() {
      expect(this.rejectFn('foo')).toBe(true);
    });

    it('rejects words matching a regexp blacklist expression', function() {
      expect(this.rejectFn('qwebarzxc')).toBe(true);
    });

    it('rejects words matching a function blacklist expression', function() {
      expect(this.rejectFn('baz')).toBe(true);
    });
  });
});
