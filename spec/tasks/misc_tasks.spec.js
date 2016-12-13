var Path = require('path'),
    fs   = require('fs');

var miscTasks = require_src('tasks/misc_tasks');

describe('Misc Tasks', function() {
  describe('generate-boundaries-file', function() {
    var contextConfig = {
      architecturalBoundaries: {
        'test_boundary': [
          { name: 'Test Layer1', paths: ['test/path1', 'test_path2'] },
          { name: 'Test Layer2', paths: ['test_path3'] }
        ]
      }
    };

    afterEach(function(done) {
      fs.unlink(Path.join(this.tasksWorkingFolders.tempDir, 'code_boundaries.txt'), done);
    });

    describe('with the boundary parameter', function() {
      beforeEach(function() {
        this.taskFunctions = this.tasksSetup(miscTasks, contextConfig,
        { boundary: 'test_boundary' });
      });

      afterEach(function() {
        this.tasksCleanup();
      });

      it('generates a code boundary file', function(done) {
        var tempDir = this.tasksWorkingFolders.tempDir;
        this.taskFunctions['generate-boundaries-file']().then(function() {
          var fileContent = fs.readFileSync(Path.join(tempDir, 'code_boundaries.txt'));
          expect(fileContent.toString()).toEqual([
            'test/path1 => Test Layer1',
            'test_path2 => Test Layer1',
            'test_path3 => Test Layer2'
          ].join("\n"));

          done();
        }).fail(function(err) {
          fail(err);
        });
      });
    });

    describe('with no boundary parameter', function() {
      beforeEach(function() {
        this.taskFunctions = this.tasksSetup(miscTasks, contextConfig);
      });

      it('does not generate a code boundary file', function(done) {
        var tempDir = this.tasksWorkingFolders.tempDir;
        this.taskFunctions['generate-boundaries-file']().then(function() {
          expect(fs.existsSync(Path.join(tempDir, 'code_boundaries.txt'))).toBeFalsy();
          done();
        }).fail(function(err) {
          fail(err);
        });
      });
    });
  });
});
