/*eslint-disable max-lines*/
var stream = require('stream'),
    reduce = require('through2-reduce');

var CodeMaatAnalyser = require_src('analysers/code_maat/code_maat_analyser'),
    command          = require_src('command');

describe('codemaat command definition', function() {
  beforeEach(function() {
    this.subject = command.Command.definitions.getDefinition('codemaat');
    this.mockCheck = jasmine.createSpyObj('check', ['verifyExecutable', 'verifyPackage', 'verifyFile']);
  });

  it('defines the "codemaat" command', function() {
    expect(this.subject.cmd).toEqual('java');
    expect(this.subject.args[0]).toEqual('-Djava.awt.headless=true');
    expect(this.subject.args[1]).toEqual({ '-jar': jasmine.stringMatching('code-maat-1.0-SNAPSHOT-standalone.jar') });
  });

  it('checks the java executable', function() {
    this.subject.installCheck.apply(this.mockCheck);

    expect(this.mockCheck.verifyExecutable).toHaveBeenCalledWith('java', jasmine.any(String));
    expect(this.mockCheck.verifyFile).toHaveBeenCalledWith(jasmine.stringMatching('code-maat-1.0-SNAPSHOT-standalone.jar'), jasmine.any(String));
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
      commandOutputStream.write(line + "\n");
    });
    commandOutputStream.end();
  };

  var verifyHandleCodeMaatError = function(analysis) {
    it('returns an empty stream when there is no output from codemaat', function(done) {
      this.subject.on('data', function(data) {
        expect(data).toEqual([]);
        assertCommand(analysis);
      })
      .on('end', done);

      stubCodeMaatReport([
        'Invalid argument: Internal error - please report it',
        '',
        'This is Code Maat, a program used to collect statistics from a VCS.'
      ]);
    });
  };

  var verifyNoData = function(analysis, headers) {
    it('returns an empty stream when there is no data', function(done) {
      this.subject.on('data', function(data) {
        expect(data).toEqual([]);
        assertCommand(analysis);
      })
      .on('end', done);

      stubCodeMaatReport([
        headers,
        ''
      ]);
    });
  };

  var assertCommand = function(revision) {
    expect(command.stream).toHaveBeenCalledWith('codemaat', [
      { '-c': 'git2', '-l': 'test/file', '-a': revision }, { 'arg1' : 'qwe', 'arg2': 'zxc', 'arg3': 'xxx' }
    ]);
  };

  beforeEach(function() {
    this.appConfigStub({ versionControlSystem: 'git', codeMaat: { options: { 'arg2': 'zxc', 'arg3': 'xxx' } } });
    commandOutputStream = new stream.PassThrough();
    spyOn(command.Command, 'ensure');
    spyOn(command, 'stream').and.returnValue(commandOutputStream);
  });

  describe('revisions analysis', function() {
    prepareAnalyserStream('revisions');
    verifyInstallCheck();
    verifyHandleCodeMaatError('revisions');
    verifyNoData('revisions', 'entity,n-revs');

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
        'entity,n-revs',
        'test/path1,18',
        'test/path2,17',
        'test/path3,15',
        'test/path4,14'
      ]);
    });
  });

  describe('soc analysis', function() {
    prepareAnalyserStream('soc');
    verifyInstallCheck();
    verifyNoData('soc', 'entity,soc');
    verifyHandleCodeMaatError('soc');

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
        'entity,soc',
        'test/path1,62',
        'test/path2,32',
        'test/path3,60',
        'test/path4,52'
      ]);
    });
  });

  describe('coupling analysis', function() {
    prepareAnalyserStream('coupling');
    verifyInstallCheck();
    verifyNoData('coupling', 'entity,coupled,degree,average-revs');
    verifyHandleCodeMaatError('coupling');

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
        'entity,coupled,degree,average-revs',
        'test/path1,test/coupledFile1,100,5',
        'test/path2,test/coupledFile2,89,4',
        'test/path3,test/coupledFile3,64,3',
        'test/path4,test/coupledFile4,34,3'
      ]);
    });
  });

  describe('authors analysis', function() {
    prepareAnalyserStream('authors');
    verifyInstallCheck();
    verifyNoData('authors', 'entity,n-authors,n-revs');
    verifyHandleCodeMaatError('authors');

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
        'entity,n-authors,n-revs',
        'test/path1,6,18',
        'test/path2,5,7',
        'test/path3,4,36',
        'test/path4,4,14'
      ]);
    });
  });

  describe('entity-effort analysis', function() {
    prepareAnalyserStream('entity-effort');
    verifyInstallCheck();
    verifyNoData('entity-effort', 'entity,author,author-revs,total-revs');
    verifyHandleCodeMaatError('entity-effort');

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
        'entity,author,author-revs,total-revs',
        'test/path1,Dev1,2,5',
        'test/path1,Dev2,3,5',
        'test/path2,Dev2,4,13',
        'test/path2,Dev3,5,13',
        'test/path2,Dev4,4,13',
        'test/path3,Dev4,3,4',
        'test/path3,Dev3,1,4',
        'test/path4,Dev3,12,12'
      ]);
    });
  });

  describe('main-dev analysis', function() {
    prepareAnalyserStream('main-dev');
    verifyInstallCheck();
    verifyNoData('main-dev', 'entity,main-dev,added,total-added,ownership');
    verifyHandleCodeMaatError('main-dev');

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
        'entity,main-dev,added,total-added,ownership',
        'test/path1,Dev1,3,5,0.45',
        'test/path2,Dev2,34,60, 0.68',
        'test/path3,Dev3,3,12,0.25',
        'test/path4,Dev4,12,40,0.26'
      ]);
    });
  });

  describe('entity-ownership analysis', function() {
    prepareAnalyserStream('entity-ownership');
    verifyInstallCheck();
    verifyNoData('entity-ownership', 'entity,author,added,deleted');
    verifyHandleCodeMaatError('entity-ownership');

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
        'entity,author,added,deleted',
        'test/path1,Dev1,2,5',
        'test/path1,Dev2,3,5',
        'test/path2,Dev2,4,3',
        'test/path2,Dev3,5,3',
        'test/path2,Dev4,4,3',
        'test/path3,Dev4,3,2',
        'test/path3,Dev3,9,8',
        'test/path4,Dev3,12,4'
      ]);
    });
  });

  describe('communication analysis', function() {
    prepareAnalyserStream('communication');
    verifyInstallCheck();
    verifyNoData('communication', 'author,peer,shared,average,strength');
    verifyHandleCodeMaatError('communication');

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
        'author,peer,shared,average,strength',
        'Dev1,Dev2,65,118,55',
        'Dev2,Dev1,65,118,55',
        'Dev3,Dev1,194,380,51',
        'Dev1,Dev3,194,380,51',
        'Dev4,Dev5,62,127,48',
        'Dev5,Dev4,62,127,48'
      ]);
    });
  });

  describe('absolute churn analysis', function() {
    prepareAnalyserStream('absolute-churn');
    verifyInstallCheck();
    verifyNoData('absolute-churn', 'date,added,deleted,commits');
    verifyHandleCodeMaatError('absolute-churn');

    it('returns a stream of the absolute churn analysis', function(done) {
      this.subject.on('data', function(data) {
        expect(data).toEqual([
          { date: '2015-12-11', addedLines: 1959, deletedLines: 2006, commits: 9 },
          { date: '2015-12-18', addedLines:  724, deletedLines:    0, commits: 4 },
          { date: '2015-12-21', addedLines:   61, deletedLines:    5, commits: 2 },
          { date: '2015-12-24', addedLines:  205, deletedLines:  131, commits: 5 },
          { date: '2015-12-31', addedLines:   22, deletedLines:    1, commits: 1 }
        ]);
        assertCommand('absolute-churn');
      }).on('end', done);

      stubCodeMaatReport([
        'date,added,deleted,commits',
        '2015-12-11,1959,2006,9',
        '2015-12-18,724,0,4',
        '2015-12-21,61,5,2',
        '2015-12-24,205,131,5',
        '2015-12-31,22,1,1'
      ]);
    });
  });

  describe('entity churn analysis', function() {
    prepareAnalyserStream('entity-churn');
    verifyInstallCheck();
    verifyNoData('entity-churn', 'entity,added,deleted,commits');
    verifyHandleCodeMaatError('entity-churn');

    it('returns a stream of the entity churn analysis', function(done) {
      this.subject.on('data', function(data) {
        expect(data).toEqual([
          { path: 'test/path1', addedLines:      0, deletedLines: 250878, commits: 1 },
          { path: 'test/path2', addedLines: 895462, deletedLines: 923349, commits: 2 },
          { path: 'test/path3', addedLines: 783048, deletedLines:  65489, commits: 3 },
          { path: 'test/path4', addedLines: 659307, deletedLines:  45631, commits: 3 },
          { path: 'test/path5', addedLines: 581630, deletedLines:      0, commits: 1 }
        ]);
        assertCommand('entity-churn');
      }).on('end', done);

      stubCodeMaatReport([
        'entity,added,deleted,commits',
        'test/path1,0,250878,1',
        'test/path2,895462,923349,2',
        'test/path3,783048,65489,3',
        'test/path4,659307,45631,3',
        'test/path5,581630,0,1'
      ]);
    });
  });
});
