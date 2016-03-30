var WordCounter = require_src('analysers/word_count/word_counter');

describe('WordCounter', function() {
  it('returns a report of all words count ordered by the highest value', function() {
    var counter = new WordCounter();
    counter.addWords(['foo', 'bar', 'baz']);
    counter.addWords(['bar', 'qaz', 'qux']);
    counter.addWords(['qaz', 'bar', 'foo']);

    expect(counter.report()).toEqual([
      { text: 'bar', count: 3 },
      { text: 'foo', count: 2 },
      { text: 'qaz', count: 2 },
      { text: 'baz', count: 1 },
      { text: 'qux', count: 1 }
    ]);
  });
});
