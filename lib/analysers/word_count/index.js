/*
 * code-forensics
 * Copyright (C) 2016-2021 Silvio Montanari
 * Distributed under the GNU General Public License v3.0
 * see http://www.gnu.org/licenses/gpl.html
 */

var WordCountAnalyser = require('./word_count_analyser'),
    utils             = require('../../utils');

var factory = new utils.SingletonFactory(WordCountAnalyser);

module.exports = {
  analyser: function() {
    return factory.instance();
  }
};
