/*global require_src*/
var _    = require('lodash'),
    ansi = require('ansi-colors');

var logger = require_src('log/logger');

describe('Logger', function() {

  var assertStdout = function(msg) {
    expect(process.stdout.write.calls.count()).toEqual(2);
    expect(process.stdout.write.calls.argsFor(0)).toEqual(['[21:14:57] ']);
    expect(process.stdout.write.calls.argsFor(1)).toEqual([msg + '\n', jasmine.any(Function)]);
  };

  beforeEach(function() {
    jasmine.clock().install();
    jasmine.clock().mockDate(new Date('2015-10-22T10:14:57.000Z'));
    _.each(['log', 'info', 'error', 'warn'], function(m) {
      logger[m].and.callThrough();
    });
    spyOn(process.stdout, 'write');
  });

  afterEach(function() {
    jasmine.clock().uninstall();
  });

  it('prefixes any log with a timestamp', function() {
    logger.log('test message');

    assertStdout('test message');
  });

  it('writes a debug message with a detail', function() {
    logger.debug('test message: ', 'test detail');
    assertStdout(ansi.green('test message: ') + 'test detail');
  });

  it('writes an info message with a detail', function() {
    logger.info('test message: ', 'test detail');
    assertStdout(ansi.yellow('test message: ') + 'test detail');
  });

  it('writes a warning message', function() {
    logger.warn('test message');
    assertStdout(ansi.bgWhite.magenta('test message'));
  });

  it('writes an error message', function() {
    logger.error('test message');
    assertStdout(ansi.bgWhite.red('test message'));
  });
});
