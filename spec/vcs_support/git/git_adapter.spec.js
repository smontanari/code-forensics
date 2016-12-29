var _      = require('lodash'),
    stream = require('stream');

var GitAdapter = require_src('vcs_support/git/git_adapter'),
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
  });

  it('ensures the git command is installed', function() {
    expect(command.Command.ensure).toHaveBeenCalledWith('git');
  });

  describe('.logStream()', function() {
    it('returns the git log as a stream', function(done) {
      var logStream = new stream.PassThrough();
      spyOn(command, 'stream').and.returnValue(logStream);

      var result = '';
      this.subject.logStream({ startDate: 'xxx', endDate: 'yyy' })
        .on('data', function(chunk) {
          result += chunk.toString();
        })
        .on('end', function() {
          expect(result).toEqual([
            '--98b656f--2016-10-31--Developer 1',
            '10  0 test/file1.yml.erb',
            '',
            '--6ff89bc--2016-10-31--Developer_2',
            '1 1 test/file2.rb',
            '',
            '--02790fd--2016-10-31--Developer.3',
            '--5fbfb14--2016-10-28--Alias developer 2',
            '0 1 test/file3.rb',
            '0 20  test/file4.html.erb',
            '6 8 test/file5.js'
          ].join("\n"));
          done();
        });

      expect(command.stream).toHaveBeenCalledWith('git',
          ['log', '--all', '--numstat', '--date=short', '--no-renames', '--pretty=format:--%h--%ad--%an', '--after=xxx', '--before=yyy'], {cwd: '/root/dir'});

      var logLines = [
        '--98b656f--2016-10-31--Developer 1',
        '10  0 test/file1.yml.erb',
        '',
        '--6ff89bc--2016-10-31--Developer_2',
        '1 1 test/file2.rb',
        '',
        '--02790fd--2016-10-31--Developer.3',
        '--5fbfb14--2016-10-28--Alias developer 2',
        '0 1 test/file3.rb',
        '0 20  test/file4.html.erb',
        '6 8 test/file5.js'
      ].join("\n");

      _.each(logLines, logStream.push.bind(logStream));
      logStream.end();
    });
  });

  describe('.commitMessagesStream()', function() {
    it('returns the git commit messages as a stream', function() {
      spyOn(command, 'stream').and.returnValue('output-stream');
      var output = this.subject.commitMessagesStream({ startDate: 'xxx', endDate: 'yyy' });

      expect(output).toEqual('output-stream');
      expect(command.stream).toHaveBeenCalledWith('git',
        ['log', '--date=short', '--pretty=format:%s', '--after=xxx', '--before=yyy'], {cwd: '/root/dir'});
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
      var revisions = this.subject.revisions('test/file', { startDate: 'xxx', endDate: 'yyy' });

      expect(revisions).toEqual([
        { revisionId: '123', date: 'test-date1' },
        { revisionId: '456', date: 'test-date2' },
        { revisionId: '789', date: 'test-date3' }
      ]);

      expect(command.run).toHaveBeenCalledWith('git',
        ['log', '--date=iso-strict', '--pretty=format:%h,%ad', '--after=xxx', '--before=yyy', 'test/file'], {cwd: '/root/dir'});
    });

    it('returns an empty list if the command output is empty', function() {
      spyOn(command, 'run').and.returnValue(new Buffer("\n"));
      var revisions = this.subject.revisions('test/file', { startDate: 'xxx', endDate: 'yyy' });

      expect(revisions).toEqual([]);
    });
  });
});
