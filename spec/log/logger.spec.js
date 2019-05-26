var lolex = require('lolex');

var logger = require('log');
jest.unmock('log');

describe('Logger', function() {
  var clock;
  var assertStdout = function(msg) {
    expect(process.stdout.write).toHaveBeenCalledWith('[10:14:57] ');
    expect(console.log).toHaveBeenCalledWith(expect.stringMatching(msg));
  };

  beforeEach(function() {
    clock = lolex.install({ now: new Date('2015-10-22T10:14:57.000Z') });
    process.stdout.write = jest.fn();
    console.log = jest.fn();
  });

  afterEach(function() {
    clock.uninstall();
  });

  it.each([
    ['debug'], ['info']
  ])('Writes a log message with detail', function(logLevel) {
    logger[logLevel]('test message: ', 'test detail');
    assertStdout(/test message: .+test detail/);
  });

  it.each([
    ['log'], ['warn'], ['error']
  ])('Writes a log message', function(logLevel) {
    logger[logLevel]('test message');
    assertStdout(/test message/);
  });
});
