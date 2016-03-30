var stream = require('stream'),
    reduce = require('through2-reduce');

var CodeMaatAnalyser = require_src('analysers/code_maat/code_maat_analyser'),
    command          = require_src('command');

describe('CodeMaatAnalyser', function() {
  var commandOutputStream;

  var analyserStream = function(instruction) {
    return new CodeMaatAnalyser(instruction).gitlogFileAnalysisStream('test/file', ['arg1', 'arg2'])
    .pipe(reduce.obj(function(data, obj) {
      data.push(obj);
      return data;
    }, []));
  };

  var stubCodeMaatReport = function(data) {
    data.forEach(function(line) {
      commandOutputStream.write(line);
    });
    commandOutputStream.end();
  };

  beforeEach(function() {
    commandOutputStream = new stream.PassThrough();
    spyOn(command, 'stream').and.returnValue(commandOutputStream);
  });

  describe('revisions analysis', function() {
    it('returns a stream of the revision data for each repository file', function(done) {
      analyserStream('revisions')
      .on('data', function(data) {
        expect(data).toEqual([
          { path: 'test/path1', revisions: 18 },
          { path: 'test/path2', revisions: 17 },
          { path: 'test/path3', revisions: 15 },
          { path: 'test/path4', revisions: 14 }
        ]);
        expect(command.stream).toHaveBeenCalledWith('codemaat', [
          '-l', 'test/file', '-a', 'revisions', 'arg1', 'arg2'
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
    it('returns a stream of the sum coupling data for each repository file', function(done) {
      analyserStream('soc')
      .on('data', function(data) {
        expect(data).toEqual([
          { path: 'test/path1', soc: 62 },
          { path: 'test/path2', soc: 32 },
          { path: 'test/path3', soc: 60 },
          { path: 'test/path4', soc: 52 }
        ]);
        expect(command.stream).toHaveBeenCalledWith('codemaat', [
          '-l', 'test/file', '-a', 'soc', 'arg1', 'arg2'
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
    it('returns a stream of the temporal coupling data for each repository file', function(done) {
      analyserStream('coupling')
      .on('data', function(data) {
        expect(data).toEqual([
          { path: 'test/path1', coupledPath: 'test/coupledFile1', couplingDegree: 100, revisionsAvg: 5 },
          { path: 'test/path2', coupledPath: 'test/coupledFile2', couplingDegree: 89, revisionsAvg: 4 },
          { path: 'test/path3', coupledPath: 'test/coupledFile3', couplingDegree: 65, revisionsAvg: 3 },
          { path: 'test/path4', coupledPath: 'test/coupledFile4', couplingDegree: 34, revisionsAvg: 3 }
        ]);
        expect(command.stream).toHaveBeenCalledWith('codemaat', [
          '-l', 'test/file', '-a', 'coupling', 'arg1', 'arg2'
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
    it('returns a stream of the authors data for each repository file', function(done) {
      analyserStream('authors')
      .on('data', function(data) {
        expect(data).toEqual([
          { path: 'test/path1', authors: 6, revisions: 18 },
          { path: 'test/path2', authors: 5, revisions: 7 },
          { path: 'test/path3', authors: 4, revisions: 36 },
          { path: 'test/path4', authors: 4, revisions: 14 }
        ]);
        expect(command.stream).toHaveBeenCalledWith('codemaat', [
          '-l', 'test/file', '-a', 'authors', 'arg1', 'arg2'
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
    it('returns a stream of the entity-ownership data for each repository file', function(done) {
      analyserStream('entity-ownership')
      .on('data', function(data) {
        expect(data).toEqual([
          { path: 'test/path1', author: 'Pat', added: 3 },
          { path: 'test/path2', author: 'Jason', added: 34 },
          { path: 'test/path3', author: 'Georg', added: 3 },
          { path: 'test/path4', author: 'Tom', added: 12 }
        ]);
        expect(command.stream).toHaveBeenCalledWith('codemaat', [
          '-l', 'test/file', '-a', 'entity-ownership', 'arg1', 'arg2'
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
