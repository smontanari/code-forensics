/*
 * code-forensics
 * Copyright (C) 2016-2019 Silvio Montanari
 * Distributed under the GNU General Public License v3.0
 * see http://www.gnu.org/licenses/gpl.html
 */

var CodeMaatAnalyser = require('./code_maat_analyser'),
    utils            = require('../../utils');

var factory = new utils.SingletonFactory(CodeMaatAnalyser);

module.exports = {
  analyser: function(parserInstruction) {
    return factory.instance(parserInstruction);
  }
};
