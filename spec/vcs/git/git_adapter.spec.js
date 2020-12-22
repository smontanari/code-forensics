var moment   = require('moment'),
    Bluebird = require('bluebird'),
    stream   = require('stream');

var GitAdapter = require('vcs/git/git_adapter'),
    TimePeriod = require('models/time_interval/time_period'),
    command    = require('command');

describe('git command definition', function() {
  var subject, mockPlatformCheck;
  beforeEach(function() {
    subject = command.Command.definitions.getDefinition('git');
    mockPlatformCheck = {
      verifyExecutable: jest.fn(),
      verifyPackage: jest.fn()
    };
  });

  it('defines the "git" command', function() {
    expect(subject).toEqual({
      cmd: 'git',
      args: [],
      installCheck: expect.any(Function)
    });
  });

  it('checks the executable', function() {
    subject.installCheck.apply(mockPlatformCheck);

    expect(mockPlatformCheck.verifyExecutable).toHaveBeenCalledWith('git', expect.any(String));
  });
});

describe('GitAdapter', function() {
  var subject, timePeriod;

  beforeEach(function() {
    command.Command.ensure = jest.fn();
    command.stream = jest.fn();
    command.run = jest.fn();

    subject = new GitAdapter({ rootPath: '/root/dir' });
    timePeriod = new TimePeriod({
      start: moment('2015-08-22T14:51:42.123Z'), end: moment('2015-10-12T11:10:06.456Z')
    });
  });

  it('ensures the git command is installed', function() {
    expect(command.Command.ensure).toHaveBeenCalledWith('git');
  });

  describe('.logStream()', function() {
    it('returns the git log as a stream', function() {
      return new Bluebird(function(done) {
        var logStream = new stream.PassThrough();
        command.stream.mockReturnValue(logStream);

        var result = '';

        subject.logStream(timePeriod)
          .on('data', function(chunk) {
            result += chunk.toString();
          })
          .on('end', function() {
            expect(result).toEqual('test-output1');
            done();
          });

        expect(command.stream).toHaveBeenCalledWith('git',
            ['log', '--all', '--numstat', '--date=short', '--no-renames', '--pretty=format:--%h--%ad--%aN', '--after=2015-08-22T14:51:42.123Z', '--before=2015-10-12T11:10:06.456Z'], {cwd: '/root/dir'});

        logStream.push('test-output1');
        logStream.end();
      });
    });
  });

  describe('.commitMessagesStream()', function() {
    it('returns the git commit messages as a stream', function() {
      command.stream.mockReturnValue('output-stream');
      var output = subject.commitMessagesStream(timePeriod);

      expect(output).toEqual('output-stream');
      expect(command.stream).toHaveBeenCalledWith('git',
        ['log', '--date=short', '--pretty=format:%s', '--after=2015-08-22T14:51:42.123Z', '--before=2015-10-12T11:10:06.456Z'], {cwd: '/root/dir'});
    });
  });

  describe('.showRevisionStream()', function() {
    it('returns the git revision content as a stream', function() {
      command.stream.mockReturnValue('output-stream');
      var output = subject.showRevisionStream('qwe123', 'test/file');

      expect(output).toEqual('output-stream');
      expect(command.stream).toHaveBeenCalledWith('git', ['show', 'qwe123:test/file'], {cwd: '/root/dir'});
    });
  });

  describe('.revisions()', function() {
    it('returns the list of revisions for the given time period', function() {
      command.run.mockReturnValue(new Buffer(
        '123,test-date1\n456,test-date2\n789,test-date3\n'
      ));
      var revisions = subject.revisions('test/file', timePeriod);

      expect(revisions).toEqual([
        { revisionId: '123', date: 'test-date1' },
        { revisionId: '456', date: 'test-date2' },
        { revisionId: '789', date: 'test-date3' }
      ]);

      expect(command.run).toHaveBeenCalledWith('git',
        ['log', '--date=iso-strict', '--pretty=format:%h,%ad', '--after=2015-08-22T14:51:42.123Z', '--before=2015-10-12T11:10:06.456Z', 'test/file'], {cwd: '/root/dir'});
    });

    it('returns an empty list if the command output is empty', function() {
      command.run.mockReturnValue(new Buffer('\n'));
      var revisions = subject.revisions('test/file', timePeriod);

      expect(revisions).toEqual([]);
    });
  });
});
