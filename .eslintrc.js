module.exports = {
  root: true,
  env: {
    node: true
  },
  extends: 'eslint:recommended',
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
        jest: true
      },
      rules: {
        'no-console': 'off'
      }
    }
  ]
};
