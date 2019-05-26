module.exports = {
  testEnvironment: 'node',
  modulePaths: ['<rootDir>/lib'],
  // testMatch: ['<rootDir>/spec/**/?(*.)spec.js'],
  testMatch: ['<rootDir>/spec/(tasks|utils|web|vcs|runtime|log|models|command|reporting|parallel_processing|graph_support|analysers)/**/*?(*.)spec.js'],
  clearMocks: true,
  errorOnDeprecated: false,

  // A path to a module which exports an async function that is triggered once before all test suites
  // globalSetup: null,

  // A path to a module which exports an async function that is triggered once after all test suites
  // globalTeardown: null,

  // setupFiles: ['<rootDir>/spec/jest_globals_setup.js'],
  setupFilesAfterEnv: ['<rootDir>/spec/jest_env_setup.js']
};
