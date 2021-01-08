/*
 * code-forensics
 * Copyright (C) 2016-2021 Silvio Montanari
 * Distributed under the GNU General Public License v3.0
 * see http://www.gnu.org/licenses/gpl.html
 */

var _  = require('lodash');

var ClipboardHelper = require('../../helpers/clipboard_helper.js');

module.exports = function(options) {
  this.bindTo = function(charts) {
    var mainChart = _.find(charts, { 'name': 'main' });
    var allDots = mainChart
      .getComponentByName('dots-' + options.seriesName)
      .getElement()
      .selectAll('circle');

    allDots.on('dblclick', ClipboardHelper.nodeEventHandler(options));
  };
};
