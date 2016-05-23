var stream = require('stream');

var FlogAnalyser = require_src('analysers/flog/flog_analyser'),
    command      = require_src('command');

describe('flog command definition', function() {
  it('defines the "flog" command', function() {
    expect(command.Command.definitions.getDefinition('flog')).toEqual(jasmine.anything());
  });
});

describe('FlogAnalyser', function() {
  var flogParser;
  beforeEach(function() {
    flogParser = jasmine.createSpyObj('FlogParser', ['read']);
    flogParser.read.and.callFake(function(report) {
      return {flog: report};
    });
    this.subject = new FlogAnalyser(flogParser);
  });

  describe('.fileAnalysisStream()', function() {
    it('parses and streams results from the flog command applied to a file', function(done) {
      var commadStream = new stream.PassThrough();
      spyOn(command, 'stream').and.returnValue(commadStream);

      this.subject.fileAnalysisStream('test/file')
      .on('data', function(data) {
        expect(command.stream).toHaveBeenCalledWith('flog', ['test/file']);
        expect(data).toEqual({ path: 'test/file', flog: 'complexity report' });
      })
      .on('finish', done);

      commadStream.write('complexity report');
      commadStream.end();
    });
  });

  describe('.sourceAnalysisStream()', function() {
    it('parses and streams results from the flog command applied to an input stream', function(done) {
      var commandProcess = { stdin: new stream.PassThrough(), stdout: new stream.PassThrough() };
      spyOn(command, 'create').and.returnValue({ asyncProcess: function() { return commandProcess; } });

      commandProcess.stdin
      .on('data', function(data) {
        expect(data.toString()).toEqual('test content');
        commandProcess.stdout.write('complexity report');
      })
      .on('end', function() {
        commandProcess.stdout.end();
      });

      var inputStream = new stream.PassThrough();
      inputStream.pipe(this.subject.sourceAnalysisStream('test/file'))
      .on('data', function(data) {
        expect(command.create).toHaveBeenCalledWith('flog', []);
        expect(data).toEqual({ path: 'test/file', flog: 'complexity report' });
      })
      .on('end', done);

      inputStream.write('test content');
      inputStream.end();
    });
  });
});
