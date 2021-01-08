/*
 * code-forensics
 * Copyright (C) 2016-2021 Silvio Montanari
 * Distributed under the GNU General Public License v3.0
 * see http://www.gnu.org/licenses/gpl.html
 */

var d3       = require('d3'),
    _        = require('lodash'),
    Bluebird = require('bluebird');

module.exports = function(options) {
  var treemap = d3.treemap()
    .size([options.width, options.height])
    .round(false);


  this.toSeries = Bluebird.method(function(data) {
    if (_.isEmpty(data.children)) {
      return null;
    }
    var rootNode = d3.hierarchy(data).sum(function(node) {
      return node[options.valueProperty];
    });
    treemap(rootNode);

    return rootNode.descendants();
  });
};
