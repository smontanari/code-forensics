var shell = require('shelljs'),
    fs    = require('fs');

var platformCheck = require_src('utils/platform_check');

describe('platformCheck', function() {
  beforeEach(function() {
    [
      'which',
      'exec',
      'echo',
      'exit'
    ].forEach(function(method) {
      spyOn(shell, method);
    });
  });

  describe('.verifyExecutable()', function() {
    it('succeeds if the executable exists', function() {
      shell.which.and.returnValue(true);

      platformCheck.verifyExecutable('test-command', 'test error');

      expect(shell.which).toHaveBeenCalledWith('test-command');
      expect(shell.exit).not.toHaveBeenCalled();
    });

    it('exits the program with an error if the executable is not found', function() {
      shell.which.and.returnValue(false);

      platformCheck.verifyExecutable('test-command', 'test error');

      expect(shell.which).toHaveBeenCalledWith('test-command');
      expect(shell.echo).toHaveBeenCalledWith(jasmine.stringMatching(/test error/));
      expect(shell.exit).toHaveBeenCalledWith(1);
    });
  });

  describe('.verifyPackage()', function() {
    it('succeeds if the command output matches the expected value', function() {
      shell.exec.and.returnValue({ stdout: 'test result ' });

      platformCheck.verifyPackage('test-command', 'test result', 'test error');

      expect(shell.exec).toHaveBeenCalledWith('test-command', { silent: true });
      expect(shell.exit).not.toHaveBeenCalled();
    });

    it('exits the program with an error if the command output does not match the expected value', function() {
      shell.exec.and.returnValue({ stdout: 'different result ' });

      platformCheck.verifyPackage('test-command', 'test result', 'test error');

      expect(shell.exec).toHaveBeenCalledWith('test-command', { silent: true });
      expect(shell.echo).toHaveBeenCalledWith(jasmine.stringMatching(/test error/));
      expect(shell.exit).toHaveBeenCalledWith(1);
    });
  });

  describe('.verifyFile()', function() {
    beforeEach(function() {
      spyOn(fs, 'existsSync');
    });

    it('succeeds if the file exists', function() {
      fs.existsSync.and.returnValue(true);

      platformCheck.verifyFile('/some/valid/file', 'test error');

      expect(shell.exit).not.toHaveBeenCalled();
    });

    it('exits the program with an error if the file is not found', function() {
      fs.existsSync.and.returnValue(false);

      platformCheck.verifyFile('/some/valid/file', 'test error');

      expect(shell.echo).toHaveBeenCalledWith(jasmine.stringMatching(/test error/));
      expect(shell.exit).toHaveBeenCalledWith(1);
    });
  });
});
