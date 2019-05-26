var WordCounter = require('analysers/word_count/word_counter');

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

  it('handles special javascript keywords', function() {
    var counter = new WordCounter();
    counter.addWords(['foo', 'bar', 'constructor']);
    counter.addWords(['bar', 'toString', 'qux']);
    counter.addWords(['toString', 'bar', 'foo']);

    expect(counter.report()).toEqual([
      { text: 'bar',         count: 3 },
      { text: 'foo',         count: 2 },
      { text: 'toString',    count: 2 },
      { text: 'constructor', count: 1 },
      { text: 'qux',         count: 1 }
    ]);
  });
});
