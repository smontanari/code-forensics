module.exports = {
  root: true,
  env: {
    node: true
  },
  extends: 'eslint:recommended',
  plugins: ['jasmine'],
  rules: {
    quotes: ['error', 'single', { avoidEscape: true }],
    semi: ['error', 'always'],
    'comma-dangle': ['error', 'never']
  },
  overrides: [
    {
      files: ['lib/web/**/*.js'],
      env: {
        browser: true
      }
    },
    {
      files: [ 'spec/**/*.js' ],
      env: {
        jasmine: true
      },
      rules: {
        'jasmine/no-suite-dupes': 'off',
        'jasmine/no-spec-dupes': 'off'
      }
    }
  ]
};
