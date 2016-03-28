var stream = require('stream'),
    reduce = require('through2-reduce'),
    _      = require('lodash');

var MultiStreamCollector = require_src('parallel_processing/multistream_collector');

describe('parallel_processing', function() {
  describe('MultiStreamCollector', function() {
    beforeEach(function() {
      this.streams = [
        new stream.PassThrough(),
        new stream.PassThrough()
      ];
      var streamFnList = _.map(this.streams, function(s) { return function() { return s; }; });
      this.subject = new MultiStreamCollector(streamFnList);
    });

    it('collects the content from all the streams', function(done) {
      var finalStream = this.subject.runWith({
        addJob: function(fn) { fn(); }
      });

      finalStream.pipe(reduce(function(data, chunk) { return data + chunk; }, ""))
      .on('data', function(s) {
        expect(s.toString()).toEqual('data-0 data-1 data-1 data-0 ');
      })
      .on('end', done);

      this.streams[0].write('data-0 ');
      this.streams[1].write('data-1 ');
      this.streams[1].write('data-1 ');
      this.streams[0].write('data-0 ');
      this.streams[0].end();
      this.streams[1].end();
    });
  });
});
