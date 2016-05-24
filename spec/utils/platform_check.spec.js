var shell = require('shelljs');

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

  describe('.findExecutable()', function() {
    it('succeeds if the executable exists', function() {
      shell.which.and.returnValue(true);

      platformCheck.findExecutable('test-command', 'test error');

      expect(shell.which).toHaveBeenCalledWith('test-command');
    });

    it('exits the program with an error if the executable is not found', function() {
      shell.which.and.returnValue(false);

      platformCheck.findExecutable('test-command', 'test error');

      expect(shell.which).toHaveBeenCalledWith('test-command');
      expect(shell.echo).toHaveBeenCalledWith(jasmine.stringMatching(/Platform dependency error\ntest error/));
      expect(shell.exit).toHaveBeenCalledWith(1);
    });
  });

  describe('.verifyPackage()', function() {
    it('succeeds if the command output matches the expected value', function() {
      shell.exec.and.returnValue({ stdout: 'test result ' });

      platformCheck.verifyPackage('test-command', 'test result', 'test error');

      expect(shell.exec).toHaveBeenCalledWith('test-command', { silent: true });
    });

    it('exits the program with an error if the command output does not match the expected value', function() {
      shell.exec.and.returnValue({ stdout: 'different result ' });

      platformCheck.verifyPackage('test-command', 'test result', 'test error');

      expect(shell.exec).toHaveBeenCalledWith('test-command', { silent: true });
      expect(shell.echo).toHaveBeenCalledWith(jasmine.stringMatching(/Platform dependency error\ntest error/));
      expect(shell.exit).toHaveBeenCalledWith(1);
    });
  });
});
