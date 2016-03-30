var stream = require('stream');

var WordCountAnalyser = require_src('analysers/word_count/word_count_analyser');

describe('WordCountAnalyser', function() {
  beforeEach(function() {
    this.inputStream = new stream.PassThrough();
  });

  describe('with no filters', function() {
    it('returns all the input words', function(done) {
      this.inputStream.pipe(new WordCountAnalyser().textAnalysisStream())
      .on('data', function(wordCountReport) {
        expect(wordCountReport).toEqual([
          { text: 'message', count: 2 },
          { text: 'first', count: 1 },
          { text: 'second', count: 1 }
        ]);
      })
      .on('end', done);

      this.inputStream.write("First message\n");
      this.inputStream.write("Second message\n");
      this.inputStream.end();
    });
  });

  describe('with text filters', function() {
    it('returns the filtered words', function(done) {
      this.inputStream.pipe(new WordCountAnalyser().textAnalysisStream([
        /^\d+ message/,
        'foo',
        function(w) { return w === 'qaz'; }
      ]))
      .on('data', function(wordCountReport) {
        expect(wordCountReport).toEqual([
          { text: 'message', count: 3 },
          { text: 'bar', count: 2 },
          { text: 'baz', count: 1 }
        ]);
      })
      .on('end', done);

      this.inputStream.write("123 message\n");
      this.inputStream.write("Bar message\n");
      this.inputStream.write("Foo Bar message\n");
      this.inputStream.write("Baz message\n");
      this.inputStream.write("qaz\n");
      this.inputStream.end();
    });
  });
});
