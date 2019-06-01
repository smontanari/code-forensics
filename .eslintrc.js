module.exports = {
  root: true,
  env: {
    node: true
  },
  plugins: ['jest'],
  extends: ['eslint:recommended', 'plugin:jest/recommended', 'plugin:jest/style'],
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
        'no-console': 'off',
        'jest/valid-describe': 'off'
      }
    }
  ]
};
