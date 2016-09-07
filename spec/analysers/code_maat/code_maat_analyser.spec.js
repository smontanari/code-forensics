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
    expect(this.subject.args[0]).toEqual('-jar');
    expect(this.subject.args[1]).toEqual('-Djava.awt.headless=true');
    expect(this.subject.args[2]).toMatch('code-maat-1.0-SNAPSHOT-standalone.jar');
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
      this.subject = new CodeMaatAnalyser(instruction).fileAnalysisStream('test/file', ['arg1', 'arg2'])
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

  beforeEach(function() {
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
        expect(command.stream).toHaveBeenCalledWith('codemaat', [
          '-c', 'git2', '-l', 'test/file', '-a', 'revisions', 'arg1', 'arg2'
        ]);
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
        expect(command.stream).toHaveBeenCalledWith('codemaat', [
          '-c', 'git2', '-l', 'test/file', '-a', 'soc', 'arg1', 'arg2'
        ]);
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
          { path: 'test/path3', coupledPath: 'test/coupledFile3', couplingDegree: 65, revisionsAvg: 3 },
          { path: 'test/path4', coupledPath: 'test/coupledFile4', couplingDegree: 34, revisionsAvg: 3 }
        ]);
        expect(command.stream).toHaveBeenCalledWith('codemaat', [
          '-c', 'git2', '-l', 'test/file', '-a', 'coupling', 'arg1', 'arg2'
        ]);
      })
      .on('end', done);

      stubCodeMaatReport([
        "entity,coupled,degree,average-revs\n",
        "test/path1,test/coupledFile1,100,5\n",
        "test/path2,test/coupledFile2,89,4\n",
        "test/path3,test/coupledFile3,65,3\n",
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
        expect(command.stream).toHaveBeenCalledWith('codemaat', [
          '-c', 'git2', '-l', 'test/file', '-a', 'authors', 'arg1', 'arg2'
        ]);
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

  describe('entity-ownership analysis', function() {
    prepareAnalyserStream('entity-ownership');
    verifyInstallCheck();

    it('returns a stream of the entity-ownership data for each repository file', function(done) {
      this.subject.on('data', function(data) {
        expect(data).toEqual([
          { path: 'test/path1', author: 'Pat', added: 3 },
          { path: 'test/path2', author: 'Jason', added: 34 },
          { path: 'test/path3', author: 'Georg', added: 3 },
          { path: 'test/path4', author: 'Tom', added: 12 }
        ]);
        expect(command.stream).toHaveBeenCalledWith('codemaat', [
          '-c', 'git2', '-l', 'test/file', '-a', 'entity-ownership', 'arg1', 'arg2'
        ]);
      })
      .on('end', done);

      stubCodeMaatReport([
        "entity,author,added,deleted\n",
        "test/path1,Pat,3,5\n",
        "test/path2,Jason,34,3\n",
        "test/path3,Georg,3,1\n",
        "test/path4,Tom,12,4\n"
      ]);
    });
  });
});
