/*
 * code-forensics
 * Copyright (C) 2016-2021 Silvio Montanari
 * Distributed under the GNU General Public License v3.0
 * see http://www.gnu.org/licenses/gpl.html
 */

var CodeMaatAnalyser    = require('./code_maat_analyser'),
    defineJavaCommand   = require('./java_command_definition'),
    defineDockerCommand = require('./docker_command_definition'),
    utils               = require('../../utils');

var factory = new utils.SingletonFactory(CodeMaatAnalyser);
defineJavaCommand();
defineDockerCommand();

module.exports = {
  analyser: function(parserInstruction) {
    return factory.instance(parserInstruction);
  }
};
