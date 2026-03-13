/*
 * code-forensics
 * Copyright (C) 2016-2021 Silvio Montanari
 * Distributed under the GNU General Public License v3.0
 * see http://www.gnu.org/licenses/gpl.html
 */

var KotlinAnalyser = require('./kotlin_analyser'),
    utils          = require('../../utils');

var factory = new utils.SingletonFactory(KotlinAnalyser);

module.exports = {
  analyser: function() {
    return factory.instance();
  }
};
