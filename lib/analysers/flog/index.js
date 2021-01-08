/*
 * code-forensics
 * Copyright (C) 2016-2021 Silvio Montanari
 * Distributed under the GNU General Public License v3.0
 * see http://www.gnu.org/licenses/gpl.html
 */

var FlogAnalyser = require('./flog_analyser'),
    FlogParser   = require('./flog_parser'),
    utils        = require('../../utils');

var factory = new utils.SingletonFactory(FlogAnalyser);
var flogParser = new FlogParser();

module.exports = {
  analyser: function() {
    return factory.instance(flogParser);
  }
};
