var Git        = require_src('vcs_support/adapters/git'),
    command    = require_src('command');

describe('git command definition', function() {
  beforeEach(function() {
    this.subject = command.Command.definitions.getDefinition('git');
    this.mockCheck = jasmine.createSpyObj('check', ['findExecutable', 'verifyPackage']);
  });

  it('defines the "git" command', function() {
    expect(this.subject).toEqual(jasmine.anything());
  });

  it('checks the executable', function() {
    this.subject.installCheck.apply(this.mockCheck);

    expect(this.mockCheck.findExecutable).toHaveBeenCalledWith('git', jasmine.any(String));
  });
});

describe('Git', function() {
  beforeEach(function() {
    spyOn(command.Command, 'ensure');
    spyOn(command, 'stream').and.returnValue('output-stream');

    this.subject = new Git('/root/dir');
  });

  it('ensures the git command is installed', function() {
    expect(command.Command.ensure).toHaveBeenCalledWith('git');
  });

  it('returns the git log as a stream', function() {
    var output = this.subject.logStream({ startDate: 'xxx', endDate: 'yyy' });

    expect(output).toEqual('output-stream');
    expect(command.stream).toHaveBeenCalledWith('git',
      ['log', '--all', '-M', '-C', '--numstat', '--date=short', '--no-renames', '--pretty=format:--%h--%ad--%an', '--after=xxx', '--before=yyy'], {cwd: '/root/dir'});
  });

  it('returns the git commit messages as a stream', function() {
    var output = this.subject.commitMessagesStream({ startDate: 'xxx', endDate: 'yyy' });

    expect(output).toEqual('output-stream');
    expect(command.stream).toHaveBeenCalledWith('git',
      ['log', '--date=short', '--pretty=format:%s', '--after=xxx', '--before=yyy'], {cwd: '/root/dir'});
  });

  it('returns the git revision content as a stream', function() {
    var output = this.subject.showRevisionStream('qwe123', 'test/file');

    expect(output).toEqual('output-stream');
    expect(command.stream).toHaveBeenCalledWith('git', ['show', 'qwe123:test/file'], {cwd: '/root/dir'});
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

    expect(command.run).toHaveBeenCalledWith('git',
      ['log', '--date=iso', '--pretty=format:%h,%ad', '--after=xxx', '--before=yyy', 'test/file'], {cwd: '/root/dir'});
  });
});
