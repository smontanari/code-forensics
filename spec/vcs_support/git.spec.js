var Git        = require_src('vcs_support/git'),
    command    = require_src('command');

describe('Git', function() {
  beforeEach(function() {
    spyOn(command, 'stream').and.returnValue('output-stream');

    this.subject = new Git('/root/dir');
  });

  it('returns the git log as a stream', function() {
    var output = this.subject.logStream({ startDate: 'xxx', endDate: 'yyy' });

    expect(output).toEqual('output-stream');
    expect(command.stream).toHaveBeenCalledWith('gitlog_analysis', ['--after=xxx', '--before=yyy'], {cwd: '/root/dir'});
  });

  it('returns the git commit messages as a stream', function() {
    var output = this.subject.commitMessagesStream({ startDate: 'xxx', endDate: 'yyy' });

    expect(output).toEqual('output-stream');
    expect(command.stream).toHaveBeenCalledWith('gitlog_messages', ['--after=xxx', '--before=yyy'], {cwd: '/root/dir'});
  });

  it('returns the git revision content as a stream', function() {
    var output = this.subject.showRevisionStream('qwe123', 'test/file');

    expect(output).toEqual('output-stream');
    expect(command.stream).toHaveBeenCalledWith('git_show', ['qwe123:test/file'], {cwd: '/root/dir'});
  });

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

    expect(command.run).toHaveBeenCalledWith('gitlog_revisions',
      ['--after=xxx', '--before=yyy', 'test/file'], {cwd: '/root/dir'});
  });
});
