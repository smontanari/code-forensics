var stream = require('stream'),
    reduce = require('through2-reduce');

var CodeMaatAnalyser = require_src('analysers/code_maat/code_maat_analyser'),
    command          = require_src('command');

describe('codemaat command definition', function() {
  beforeEach(function() {
    this.subject = command.Command.definitions.getDefinition('codemaat');
    this.mockCheck = jasmine.createSpyObj('check', ['findExecutable', 'verifyPackage']);
  });

  it('defines the "codemaat" command', function() {
    expect(this.subject.cmd).toEqual('java');
    expect(this.subject.args[0]).toEqual('-Djava.awt.headless=true');
    expect(this.subject.args[1]).toEqual({ '-jar': jasmine.stringMatching('code-maat-1.0-SNAPSHOT-standalone.jar') });
  });

  it('checks the java executable', function() {
    this.subject.installCheck.apply(this.mockCheck);

    expect(this.mockCheck.findExecutable).toHaveBeenCalledWith('java', jasmine.any(String));
  });
});

describe('CodeMaatAnalyser', function() {
  var commandOutputStream;

  var prepareAnalyserStream = function(instruction) {
    beforeEach(function() {
      this.subject = new CodeMaatAnalyser(instruction)
      .fileAnalysisStream('test/file', { 'arg1' : 'qwe', 'arg2': 'asd' })
      .pipe(reduce.obj(function(data, obj) {
        data.push(obj);
        return data;
      }, []));
    });
  };

  var verifyInstallCheck = function() {
    it('ensures the codemaat command is installed', function() {
      expect(command.Command.ensure).toHaveBeenCalledWith('codemaat');
    });
  };

  var stubCodeMaatReport = function(data) {
    data.forEach(function(line) {
      commandOutputStream.write(line);
    });
    commandOutputStream.end();
  };

  var assertCommand = function(revision) {
    expect(command.stream).toHaveBeenCalledWith('codemaat', [
      { '-c': 'git2', '-l': 'test/file', '-a': revision }, { 'arg1' : 'qwe', 'arg2': 'zxc', 'arg3': 'xxx' }
    ]);
  };

  beforeEach(function() {
    this.appConfigStub({ versionControlSystem: 'git', codeMaatOptions: { 'arg2': 'zxc', 'arg3': 'xxx' } });
    commandOutputStream = new stream.PassThrough();
    spyOn(command.Command, 'ensure');
    spyOn(command, 'stream').and.returnValue(commandOutputStream);
  });

  describe('revisions analysis', function() {
    prepareAnalyserStream('revisions');
    verifyInstallCheck();

    it('returns a stream of the revision data for each repository file', function(done) {
      this.subject.on('data', function(data) {
        expect(data).toEqual([
          { path: 'test/path1', revisions: 18 },
          { path: 'test/path2', revisions: 17 },
          { path: 'test/path3', revisions: 15 },
          { path: 'test/path4', revisions: 14 }
        ]);
        assertCommand('revisions');
      })
      .on('end', done);

      stubCodeMaatReport([
        "entity,n-revs\n",
        "test/path1,18\n",
        "test/path2,17\n",
        "test/path3,15\n",
        "test/path4,14\n"
      ]);
    });
  });

  describe('soc analysis', function() {
    prepareAnalyserStream('soc');
    verifyInstallCheck();

    it('returns a stream of the sum coupling data for each repository file', function(done) {
      this.subject.on('data', function(data) {
        expect(data).toEqual([
          { path: 'test/path1', soc: 62 },
          { path: 'test/path2', soc: 32 },
          { path: 'test/path3', soc: 60 },
          { path: 'test/path4', soc: 52 }
        ]);
        assertCommand('soc');
      })
      .on('end', done);

      stubCodeMaatReport([
        "entity,soc\n",
        "test/path1,62\n",
        "test/path2,32\n",
        "test/path3,60\n",
        "test/path4,52\n"
      ]);
    });
  });

  describe('coupling analysis', function() {
    prepareAnalyserStream('coupling');
    verifyInstallCheck();

    it('returns a stream of the temporal coupling data for each repository file', function(done) {
      this.subject.on('data', function(data) {
        expect(data).toEqual([
          { path: 'test/path1', coupledPath: 'test/coupledFile1', couplingDegree: 100, revisionsAvg: 5 },
          { path: 'test/path2', coupledPath: 'test/coupledFile2', couplingDegree: 89, revisionsAvg: 4 },
          { path: 'test/path3', coupledPath: 'test/coupledFile3', couplingDegree: 64, revisionsAvg: 3 },
          { path: 'test/path4', coupledPath: 'test/coupledFile4', couplingDegree: 34, revisionsAvg: 3 }
        ]);
        assertCommand('coupling');
      })
      .on('end', done);

      stubCodeMaatReport([
        "entity,coupled,degree,average-revs\n",
        "test/path1,test/coupledFile1,100,5\n",
        "test/path2,test/coupledFile2,89,4\n",
        "test/path3,test/coupledFile3,64,3\n",
        "test/path4,test/coupledFile4,34,3\n"
      ]);
    });
  });

  describe('authors analysis', function() {
    prepareAnalyserStream('authors');
    verifyInstallCheck();

    it('returns a stream of the authors data for each repository file', function(done) {
      this.subject.on('data', function(data) {
        expect(data).toEqual([
          { path: 'test/path1', authors: 6, revisions: 18 },
          { path: 'test/path2', authors: 5, revisions: 7 },
          { path: 'test/path3', authors: 4, revisions: 36 },
          { path: 'test/path4', authors: 4, revisions: 14 }
        ]);
        assertCommand('authors');
      })
      .on('end', done);

      stubCodeMaatReport([
        "entity,n-authors,n-revs\n",
        "test/path1,6,18\n",
        "test/path2,5,7\n",
        "test/path3,4,36\n",
        "test/path4,4,14\n"
      ]);
    });
  });

  describe('entity-effort analysis', function() {
    prepareAnalyserStream('entity-effort');
    verifyInstallCheck();

    it('returns a stream of the entity-effort data for each repository file', function(done) {
      this.subject.on('data', function(data) {
        expect(data).toEqual([
          { path: 'test/path1', author: 'Pat', revisions: 2 },
          { path: 'test/path1', author: 'Jason', revisions: 3 },
          { path: 'test/path2', author: 'Jason', revisions: 4 },
          { path: 'test/path2', author: 'Tom', revisions: 5 },
          { path: 'test/path2', author: 'Georg', revisions: 4 },
          { path: 'test/path3', author: 'Georg', revisions: 3 },
          { path: 'test/path3', author: 'Tom', revisions: 1 },
          { path: 'test/path4', author: 'Tom', revisions: 12 }
        ]);
        assertCommand('entity-effort');
      })
      .on('end', done);

      stubCodeMaatReport([
        "entity,author,author-revs,total-revs\n",
        "test/path1,Pat,2,5\n",
        "test/path1,Jason,3,5\n",
        "test/path2,Jason,4,13\n",
        "test/path2,Tom,5,13\n",
        "test/path2,Georg,4,13\n",
        "test/path3,Georg,3,4\n",
        "test/path3,Tom,1,4\n",
        "test/path4,Tom,12,12\n"
      ]);
    });
  });

  describe('main-dev analysis', function() {
    prepareAnalyserStream('main-dev');
    verifyInstallCheck();

    it('returns a stream of the main-dev data for each repository file', function(done) {
      this.subject.on('data', function(data) {
        expect(data).toEqual([
          { path: 'test/path1', author: 'Pat', ownership: 45 },
          { path: 'test/path2', author: 'Jason', ownership: 68 },
          { path: 'test/path3', author: 'Georg', ownership: 25 },
          { path: 'test/path4', author: 'Tom', ownership: 26 }
        ]);
        assertCommand('main-dev');
      })
      .on('end', done);

      stubCodeMaatReport([
        "entity,main-dev,added,total-added,ownership\n",
        "test/path1,Pat,3,5,0.45\n",
        "test/path2,Jason,34,60, 0.68\n",
        "test/path3,Georg,3,12,0.25\n",
        "test/path4,Tom,12,40,0.26\n"
      ]);
    });
  });

  describe('entity-ownership analysis', function() {
    prepareAnalyserStream('entity-ownership');
    verifyInstallCheck();

    it('returns a stream of the entity-ownership data for each repository file', function(done) {
      this.subject.on('data', function(data) {
        expect(data).toEqual([
          { path: 'test/path1', author: 'Pat', addedLines: 2, deletedLines: 5 },
          { path: 'test/path1', author: 'Jason', addedLines: 3, deletedLines: 5 },
          { path: 'test/path2', author: 'Jason', addedLines: 4, deletedLines: 3 },
          { path: 'test/path2', author: 'Tom', addedLines: 5, deletedLines: 3 },
          { path: 'test/path2', author: 'Georg', addedLines: 4, deletedLines: 3 },
          { path: 'test/path3', author: 'Georg', addedLines: 3, deletedLines: 2 },
          { path: 'test/path3', author: 'Tom', addedLines: 9, deletedLines: 8 },
          { path: 'test/path4', author: 'Tom', addedLines: 12, deletedLines: 4 }
        ]);
        assertCommand('entity-ownership');
      }).on('end', done);

      stubCodeMaatReport([
        "entity,author,added,deleted\n",
        "test/path1,Pat,2,5\n",
        "test/path1,Jason,3,5\n",
        "test/path2,Jason,4,3\n",
        "test/path2,Tom,5,3\n",
        "test/path2,Georg,4,3\n",
        "test/path3,Georg,3,2\n",
        "test/path3,Tom,9,8\n",
        "test/path4,Tom,12,4\n"
      ]);
    });
  });
});
