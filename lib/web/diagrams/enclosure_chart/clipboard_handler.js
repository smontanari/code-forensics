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
    var allLeafNodes = mainChart
      .getComponentByName('node-data')
      .getElement()
      .selectAll('circle')
      .filter(_.method('isLeaf'));

    allLeafNodes.on('dblclick', ClipboardHelper.nodeEventHandler(options));
  };
};
