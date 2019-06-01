var EnvConfigReader = require('runtime/env_config_reader');

describe('EnvConfigReader', function() {
  beforeEach(function() {
    delete process.env.MAX_CONCURRENCY;
    delete process.env.SERIAL_PROCESSING;
    delete process.env.COMMAND_DEBUG;
    delete process.env.LOG_DISABLED;
    delete process.env.SERVER_PORT;
    delete process.env.CODEMAAT_OPTS;
  });

  describe('when no environment variables exist', function() {
    it('returns an object with default values', function() {
      expect(new EnvConfigReader().getConfiguration()).toEqual({
        maxConcurrency: undefined,
        debugMode: false,
        logEnabled: true,
        serverPort: undefined,
        codeMaat: { options: {} }
      });
    });
  });

  describe('when environment variables exist', function() {
    it('returns an object with a max concurrency value based on MAX_CONCURRENCY', function() {
      process.env.MAX_CONCURRENCY = '3';

      expect(new EnvConfigReader().getConfiguration().maxConcurrency).toEqual(3);
    });

    it('returns an object with a max concurrency equal to 1', function() {
      process.env.MAX_CONCURRENCY = '3';
      process.env.SERIAL_PROCESSING = 'true';

      expect(new EnvConfigReader().getConfiguration().maxConcurrency).toEqual(1);
    });

    it('returns an object with a debug mode value', function() {
      process.env.COMMAND_DEBUG = '1';

      expect(new EnvConfigReader().getConfiguration().debugMode).toBe(true);
    });

    it('returns an object with a log enabled value', function() {
      process.env.LOG_DISABLED = '1';

      expect(new EnvConfigReader().getConfiguration().logEnabled).toBe(false);
    });

    it('returns an object with a server port value', function() {
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
