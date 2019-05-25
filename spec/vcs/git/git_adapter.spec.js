/*global require_src*/
var moment = require('moment'),
    stream = require('stream');

var GitAdapter = require_src('vcs/git/git_adapter'),
    TimePeriod = require_src('models/time_interval/time_period'),
    command    = require_src('command');

describe('git command definition', function() {
  beforeEach(function() {
    this.subject = command.Command.definitions.getDefinition('git');
    this.mockCheck = jasmine.createSpyObj('check', ['verifyExecutable', 'verifyPackage']);
  });

  it('defines the "git" command', function() {
    expect(this.subject).toEqual(jasmine.anything());
  });

  it('checks the executable', function() {
    this.subject.installCheck.apply(this.mockCheck);

    expect(this.mockCheck.verifyExecutable).toHaveBeenCalledWith('git', jasmine.any(String));
  });
});

describe('GitAdapter', function() {
  beforeEach(function() {
    spyOn(command.Command, 'ensure');

    this.subject = new GitAdapter({ rootPath: '/root/dir' });
    this.timePeriod = new TimePeriod({
      start: moment('2015-08-22T14:51:42.123Z'), end: moment('2015-10-12T11:10:06.456Z')
    });
  });

  it('ensures the git command is installed', function() {
    expect(command.Command.ensure).toHaveBeenCalledWith('git');
  });

  describe('.logStream()', function() {
    it('returns the git log as a stream', function(done) {
      var logStream = new stream.PassThrough();
      spyOn(command, 'stream').and.returnValue(logStream);

      var result = '';

      this.subject.logStream(this.timePeriod)
        .on('data', function(chunk) {
          result += chunk.toString();
        })
        .on('end', function() {
          expect(result).toEqual('test-output1');
          done();
        });

      expect(command.stream).toHaveBeenCalledWith('git',
          ['log', '--all', '--numstat', '--date=short', '--no-renames', '--pretty=format:--%h--%ad--%an', '--after=2015-08-22T14:51:42.123Z', '--before=2015-10-12T11:10:06.456Z'], {cwd: '/root/dir'});

      logStream.push('test-output1');
      logStream.end();
    });
  });

  describe('.commitMessagesStream()', function() {
    it('returns the git commit messages as a stream', function() {
      spyOn(command, 'stream').and.returnValue('output-stream');
      var output = this.subject.commitMessagesStream(this.timePeriod);

      expect(output).toEqual('output-stream');
      expect(command.stream).toHaveBeenCalledWith('git',
        ['log', '--date=short', '--pretty=format:%s', '--after=2015-08-22T14:51:42.123Z', '--before=2015-10-12T11:10:06.456Z'], {cwd: '/root/dir'});
    });
  });

  describe('.showRevisionStream()', function() {
    it('returns the git revision content as a stream', function() {
      spyOn(command, 'stream').and.returnValue('output-stream');
      var output = this.subject.showRevisionStream('qwe123', 'test/file');

      expect(output).toEqual('output-stream');
      expect(command.stream).toHaveBeenCalledWith('git', ['show', 'qwe123:test/file'], {cwd: '/root/dir'});
    });
  });

  describe('.revisions()', function() {
    it('returns the list of revisions for the given time period', function() {
      spyOn(command, 'run').and.returnValue(new Buffer(
        '123,test-date1\n456,test-date2\n789,test-date3\n'
      ));
      var revisions = this.subject.revisions('test/file', this.timePeriod);

      expect(revisions).toEqual([
        { revisionId: '123', date: 'test-date1' },
        { revisionId: '456', date: 'test-date2' },
        { revisionId: '789', date: 'test-date3' }
      ]);

      expect(command.run).toHaveBeenCalledWith('git',
        ['log', '--date=iso-strict', '--pretty=format:%h,%ad', '--after=2015-08-22T14:51:42.123Z', '--before=2015-10-12T11:10:06.456Z', 'test/file'], {cwd: '/root/dir'});
    });

    it('returns an empty list if the command output is empty', function() {
      spyOn(command, 'run').and.returnValue(new Buffer('\n'));
      var revisions = this.subject.revisions('test/file', this.timePeriod);

      expect(revisions).toEqual([]);
    });
  });
});
