/*
 * code-forensics
 * Copyright (C) 2016-2019 Silvio Montanari
 * Distributed under the GNU General Public License v3.0
 * see http://www.gnu.org/licenses/gpl.html
 */

var SlocAnalyser = require('./sloc_analyser'),
    utils        = require('../../utils');

var factory = new utils.SingletonFactory(SlocAnalyser);

module.exports = {
  analyser: function() {
    return factory.instance();
  }
};
