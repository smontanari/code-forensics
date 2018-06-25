/*global require_src*/
var stream = require('stream');

var FlogAnalyser = require_src('analysers/flog/flog_analyser'),
    command      = require_src('command');

describe('flog command definition', function() {
  beforeEach(function() {
    this.subject = command.Command.definitions.getDefinition('flog');
    this.mockCheck = jasmine.createSpyObj('check', ['verifyExecutable', 'verifyPackage']);
  });

  it('defines the "flog" command', function() {
    expect(this.subject).toEqual(jasmine.anything());
  });

  it('checks the executable', function() {
    this.subject.installCheck.apply(this.mockCheck);

    expect(this.mockCheck.verifyExecutable).toHaveBeenCalledWith('ruby', jasmine.any(String));
  });

  it('checks the flog gem', function() {
    this.subject.installCheck.apply(this.mockCheck);

    expect(this.mockCheck.verifyPackage).toHaveBeenCalledWith(jasmine.stringMatching(/gem list flog -i/), 'true', jasmine.any(String));
  });
});

describe('FlogAnalyser', function() {
  var flogParser;
  beforeEach(function() {
    spyOn(command.Command, 'ensure');
    flogParser = jasmine.createSpyObj('FlogParser', ['read']);
    flogParser.read.and.callFake(function(report) {
      return {flog: report};
    });
    this.subject = new FlogAnalyser(flogParser);
  });

  it('ensures the flog command is installed', function() {
    expect(command.Command.ensure).toHaveBeenCalledWith('flog');
  });

  describe('.fileAnalysisStream()', function() {
    describe('without any transformation', function() {
      it('parses and streams results from the flog command applied to a file', function(done) {
        var commadStream = new stream.PassThrough();
        spyOn(command, 'stream').and.returnValue(commadStream);
        var report;

        this.subject.fileAnalysisStream('test/file')
        .on('data', function(data) {
          report = data;
        })
        .on('finish', function() {
          expect(command.stream).toHaveBeenCalledWith('flog', ['test/file']);
          expect(report).toEqual({ path: 'test/file', flog: 'complexity report' });
          done();
        });

        commadStream.write('complexity report');
        commadStream.end();
      });
    });

    describe('with a transformation applied to the report', function() {
      it('parses and streams results from the flog command applied to a file and tranforms the end report', function(done) {
        var commadStream = new stream.PassThrough();
        spyOn(command, 'stream').and.returnValue(commadStream);
        var report;

        this.subject.fileAnalysisStream('test/file', function(report) { return { test: 'some value', result: report.flog }; })
        .on('data', function(data) {
          report = data;
        })
        .on('finish', function() {
          expect(command.stream).toHaveBeenCalledWith('flog', ['test/file']);
          expect(report).toEqual({ test: 'some value', result: 'complexity report' });
          done();
        });

        commadStream.write('complexity report');
        commadStream.end();
      });
    });
  });

  describe('.sourceAnalysisStream()', function() {
    describe('without any transformation', function() {
      it('parses and streams results from the flog command applied to an input stream', function(done) {
        var commandProcess = { stdin: new stream.PassThrough(), stdout: new stream.PassThrough() };
        spyOn(command, 'create').and.returnValue({ asyncProcess: function() { return commandProcess; } });
        var report;

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
          report = data;
        })
        .on('end', function() {
          expect(report).toEqual({ path: 'test/file', flog: 'complexity report' });
          expect(command.create).toHaveBeenCalledWith('flog', []);
          done();
        });

        inputStream.write('test content');
        inputStream.end();
      });
    });

    describe('with a transformation applied to the report', function() {
      it('parses and streams results from the flog command applied to a stream and tranforms the end report', function(done) {
        var commandProcess = { stdin: new stream.PassThrough(), stdout: new stream.PassThrough() };
        spyOn(command, 'create').and.returnValue({ asyncProcess: function() { return commandProcess; } });
        var report;

        commandProcess.stdin
        .on('data', function(data) {
          expect(data.toString()).toEqual('test content');
          commandProcess.stdout.write('complexity report');
        })
        .on('end', function() {
          commandProcess.stdout.end();
        });

        var inputStream = new stream.PassThrough();
        inputStream.pipe(this.subject.sourceAnalysisStream('test/file', function(report) { return { test: 'some value', result: report.flog }; }))
        .on('data', function(data) {
          report = data;
        })
        .on('end', function() {
          expect(report).toEqual({ test: 'some value', result: 'complexity report' });
          expect(command.create).toHaveBeenCalledWith('flog', []);
          done();
        });

        inputStream.write('test content');
        inputStream.end();
      });
    });
  });
});
