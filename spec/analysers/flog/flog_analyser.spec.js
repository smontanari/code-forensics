var stream   = require('stream'),
    Bluebird = require('bluebird');

var FlogAnalyser = require('analysers/flog/flog_analyser'),
    command      = require('command');

describe('flog command definition', function() {
  var subject, mockCheck;
  beforeEach(function() {
    subject = command.Command.definitions.getDefinition('flog');
    mockCheck = {
      verifyExecutable: jest.fn(),
      verifyPackage: jest.fn()
    };
  });

  it('defines the "flog" command', function() {
    expect(subject).toEqual({
      cmd: 'flog',
      args: [ '-a' ],
      installCheck: expect.any(Function)
    });
  });

  it('checks the executable', function() {
    subject.installCheck.apply(mockCheck);

    expect(mockCheck.verifyExecutable).toHaveBeenCalledWith('ruby', expect.any(String));
  });

  it('checks the flog gem', function() {
    subject.installCheck.apply(mockCheck);

    expect(mockCheck.verifyPackage).toHaveBeenCalledWith(
      expect.stringMatching(/gem list flog -i/), 'true',
      expect.any(String)
    );
  });
});

describe('FlogAnalyser', function() {
  var subject;
  beforeEach(function() {
    command.Command.ensure = jest.fn();
    var flogParser = {
      read: function(report) { return {flog: report}; }
    };
    subject = new FlogAnalyser(flogParser);
  });

  it('ensures the flog command is installed', function() {
    expect(command.Command.ensure).toHaveBeenCalledWith('flog');
  });

  describe('.fileAnalysisStream()', function() {
    describe('without any transformation', function() {
      it('parses and streams results from the flog command applied to a file', function() {
        return new Bluebird(function(done) {
          var commadStream = new stream.PassThrough();
          command.stream = jest.fn().mockReturnValue(commadStream);
          var report;

          subject.fileAnalysisStream('test/file')
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
    });

    describe('with a transformation applied to the report', function() {
      it('parses and streams results from the flog command applied to a file and tranforms the end report', function() {
        return new Bluebird(function(done) {
          var commadStream = new stream.PassThrough();
          command.stream = jest.fn().mockReturnValue(commadStream);
          var report;

          subject.fileAnalysisStream('test/file', function(report) { return { test: 'some value', result: report.flog }; })
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
  });

  describe('.sourceAnalysisStream()', function() {
    describe('without any transformation', function() {
      it('parses and streams results from the flog command applied to an input stream', function() {
        return new Bluebird(function(done) {
          var commandProcess = { stdin: new stream.PassThrough(), stdout: new stream.PassThrough() };
          command.createAsync = jest.fn().mockReturnValue(commandProcess);
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
          inputStream.pipe(subject.sourceAnalysisStream('test/file'))
          .on('data', function(data) {
            report = data;
          })
          .on('end', function() {
            expect(report).toEqual({ path: 'test/file', flog: 'complexity report' });
            expect(command.createAsync).toHaveBeenCalledWith('flog', []);
            done();
          });

          inputStream.write('test content');
          inputStream.end();
        });
      });
    });

    describe('with a transformation applied to the report', function() {
      it('parses and streams results from the flog command applied to a stream and tranforms the end report', function() {
        return new Bluebird(function(done) {
          var commandProcess = { stdin: new stream.PassThrough(), stdout: new stream.PassThrough() };
          command.createAsync = jest.fn().mockReturnValue(commandProcess);
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
          inputStream.pipe(subject.sourceAnalysisStream('test/file', function(report) { return { test: 'some value', result: report.flog }; }))
          .on('data', function(data) {
            report = data;
          })
          .on('end', function() {
            expect(report).toEqual({ test: 'some value', result: 'complexity report' });
            expect(command.createAsync).toHaveBeenCalledWith('flog', []);
            done();
          });

          inputStream.write('test content');
          inputStream.end();
        });
      });
    });
  });
});
