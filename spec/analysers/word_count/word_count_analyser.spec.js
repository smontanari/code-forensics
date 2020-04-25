var stream   = require('stream'),
    Bluebird = require('bluebird');

var WordCountAnalyser = require('analysers/word_count/word_count_analyser');

describe('WordCountAnalyser', function() {
  var inputStream;
  beforeEach(function() {
    inputStream = new stream.PassThrough();
  });

  describe('with no filters', function() {
    it('returns all the input words', function() {
      return new Bluebird(function(done) {
        inputStream.pipe(new WordCountAnalyser().textAnalysisStream())
        .on('data', function(wordCountReport) {
          expect(wordCountReport).toEqual([
            { text: 'message', count: 2 },
            { text: 'first', count: 1 },
            { text: 'second', count: 1 }
          ]);
        })
        .on('end', done);

        inputStream.write('First message\n');
        inputStream.write('Second message\n');
        inputStream.end();
      });
    });
  });

  describe('with text filters', function() {
    it('returns the filtered words', function() {
      return new Bluebird(function(done) {
        inputStream.pipe(new WordCountAnalyser().textAnalysisStream([
          /^\d+ message/,
          'foo',
          function(w) { return w === 'qaz'; }
        ]))
        .on('data', function(wordCountReport) {
          expect(wordCountReport).toEqual([
            { text: 'message', count: 3 },
            { text: 'bar', count: 2 },
            { text: 'baz-qaz', count: 1 }
          ]);
        })
        .on('end', done);

        inputStream.write('123 message\n');
        inputStream.write('Bar message\n');
        inputStream.write('Foo Bar message\n');
        inputStream.write('Baz-qaz  message\n');
        inputStream.write('qaz\n');
        inputStream.end();
      });
    });
  });
});
