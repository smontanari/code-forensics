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
          { path: 'test/path1', author: 'Dev1', revisions: 2 },
          { path: 'test/path1', author: 'Dev2', revisions: 3 },
          { path: 'test/path2', author: 'Dev2', revisions: 4 },
          { path: 'test/path2', author: 'Dev3', revisions: 5 },
          { path: 'test/path2', author: 'Dev4', revisions: 4 },
          { path: 'test/path3', author: 'Dev4', revisions: 3 },
          { path: 'test/path3', author: 'Dev3', revisions: 1 },
          { path: 'test/path4', author: 'Dev3', revisions: 12 }
        ]);
        assertCommand('entity-effort');
      })
      .on('end', done);

      stubCodeMaatReport([
        "entity,author,author-revs,total-revs\n",
        "test/path1,Dev1,2,5\n",
        "test/path1,Dev2,3,5\n",
        "test/path2,Dev2,4,13\n",
        "test/path2,Dev3,5,13\n",
        "test/path2,Dev4,4,13\n",
        "test/path3,Dev4,3,4\n",
        "test/path3,Dev3,1,4\n",
        "test/path4,Dev3,12,12\n"
      ]);
    });
  });

  describe('main-dev analysis', function() {
    prepareAnalyserStream('main-dev');
    verifyInstallCheck();

    it('returns a stream of the main-dev data for each repository file', function(done) {
      this.subject.on('data', function(data) {
        expect(data).toEqual([
          { path: 'test/path1', author: 'Dev1', ownership: 45, addedLines: 3 },
          { path: 'test/path2', author: 'Dev2', ownership: 68, addedLines: 34 },
          { path: 'test/path3', author: 'Dev3', ownership: 25, addedLines: 3 },
          { path: 'test/path4', author: 'Dev4', ownership: 26, addedLines: 12 }
        ]);
        assertCommand('main-dev');
      })
      .on('end', done);

      stubCodeMaatReport([
        "entity,main-dev,added,total-added,ownership\n",
        "test/path1,Dev1,3,5,0.45\n",
        "test/path2,Dev2,34,60, 0.68\n",
        "test/path3,Dev3,3,12,0.25\n",
        "test/path4,Dev4,12,40,0.26\n"
      ]);
    });
  });

  describe('entity-ownership analysis', function() {
    prepareAnalyserStream('entity-ownership');
    verifyInstallCheck();

    it('returns a stream of the entity-ownership data for each repository file', function(done) {
      this.subject.on('data', function(data) {
        expect(data).toEqual([
          { path: 'test/path1', author: 'Dev1', addedLines: 2, deletedLines: 5 },
          { path: 'test/path1', author: 'Dev2', addedLines: 3, deletedLines: 5 },
          { path: 'test/path2', author: 'Dev2', addedLines: 4, deletedLines: 3 },
          { path: 'test/path2', author: 'Dev3', addedLines: 5, deletedLines: 3 },
          { path: 'test/path2', author: 'Dev4', addedLines: 4, deletedLines: 3 },
          { path: 'test/path3', author: 'Dev4', addedLines: 3, deletedLines: 2 },
          { path: 'test/path3', author: 'Dev3', addedLines: 9, deletedLines: 8 },
          { path: 'test/path4', author: 'Dev3', addedLines: 12, deletedLines: 4 }
        ]);
        assertCommand('entity-ownership');
      }).on('end', done);

      stubCodeMaatReport([
        "entity,author,added,deleted\n",
        "test/path1,Dev1,2,5\n",
        "test/path1,Dev2,3,5\n",
        "test/path2,Dev2,4,3\n",
        "test/path2,Dev3,5,3\n",
        "test/path2,Dev4,4,3\n",
        "test/path3,Dev4,3,2\n",
        "test/path3,Dev3,9,8\n",
        "test/path4,Dev3,12,4\n"
      ]);
    });
  });

  describe('communication analysis', function() {
    prepareAnalyserStream('communication');
    verifyInstallCheck();

    it('returns a stream of the communication coupling for each authors pair', function(done) {
      this.subject.on('data', function(data) {
        expect(data).toEqual([
          { author: 'Dev1', coupledAuthor: 'Dev2', sharedCommits: 65, couplingStrength: 55 },
          { author: 'Dev2', coupledAuthor: 'Dev1', sharedCommits: 65, couplingStrength: 55 },
          { author: 'Dev3', coupledAuthor: 'Dev1', sharedCommits: 194, couplingStrength: 51 },
          { author: 'Dev1', coupledAuthor: 'Dev3', sharedCommits: 194, couplingStrength: 51 },
          { author: 'Dev4', coupledAuthor: 'Dev5', sharedCommits: 62, couplingStrength: 48 },
          { author: 'Dev5', coupledAuthor: 'Dev4', sharedCommits: 62, couplingStrength: 48 }
        ]);
        assertCommand('communication');
      }).on('end', done);

      stubCodeMaatReport([
        "author,peer,shared,average,strength\n",
        "Dev1,Dev2,65,118,55\n",
        "Dev2,Dev1,65,118,55\n",
        "Dev3,Dev1,194,380,51\n",
        "Dev1,Dev3,194,380,51\n",
        "Dev4,Dev5,62,127,48\n",
        "Dev5,Dev4,62,127,48"
      ]);
    });
  });
});
