var FlogAnalyser = require('./flog_analyser'),
    FlogParser   = require('./flog_parser');

module.exports = {
  analyser: new FlogAnalyser(new FlogParser())
};
