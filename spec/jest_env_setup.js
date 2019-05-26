var mtz = require('moment-timezone');

jest.mock('gulp');
jest.mock('log');

beforeAll(function() {
  mtz.tz.setDefault('UTC');
});

afterAll(function() {
  mtz.tz.setDefault();
});
