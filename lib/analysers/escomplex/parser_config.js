module.exports = {
  esprima: {
    parser: require('esprima'),
    defaultOptions: { loc: true },
  },
  acorn: {
    parser: require('acorn-jsx'),
    defaultOptions: { locations: true }
  }
};
