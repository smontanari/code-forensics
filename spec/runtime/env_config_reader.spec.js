var EnvConfigReader = require_src('runtime/env_config_reader');

describe('EnvConfigReader', function() {
  beforeEach(function() {
    delete process.env.MAX_CONCURRENCY;
    delete process.env.COMMAND_DEBUG;
    delete process.env.LOG_DISABLED;
    delete process.env.SERVER_PORT;
    delete process.env.CODEMAAT_OPTS;
  });

  describe('when no environment variables exist', function() {
    it('returns an object with default values', function() {
      expect(new EnvConfigReader().getConfiguration()).toEqual({
        maxConcurrency: undefined,
        debugMode: undefined,
        logEnabled: undefined,
        serverPort: undefined,
        codeMaat: { options: undefined }
      });
    });
  });

  describe('when environment variables exist', function() {
    it('returns an object with a max concurrency value', function() {
      process.env.MAX_CONCURRENCY = '3';

      expect(new EnvConfigReader().getConfiguration().maxConcurrency).toEqual(3);
    });

    it('returns an object with a debug mode value', function() {
      process.env.COMMAND_DEBUG = '1';

      expect(new EnvConfigReader().getConfiguration().debugMode).toBe(true);
    });

    it('returns an object with a log enabled value', function() {
      process.env.LOG_DISABLED = '1';

      expect(new EnvConfigReader().getConfiguration().logEnabled).toBe(false);
    });

    it('returns an object with a log enabled value', function() {
      process.env.SERVER_PORT = '1234';

      expect(new EnvConfigReader().getConfiguration().serverPort).toEqual(1234);
    });

    it('returns an object with codeMaat options values', function() {
      process.env.CODEMAAT_OPTS = '-a 123 -b zxc';

      expect(new EnvConfigReader().getConfiguration().codeMaat.options).toEqual({
        '-a': '123',
        '-b': 'zxc'
      });
    });
  });
});
