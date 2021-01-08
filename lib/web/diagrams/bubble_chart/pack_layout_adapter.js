/*
 * code-forensics
 * Copyright (C) 2016-2021 Silvio Montanari
 * Distributed under the GNU General Public License v3.0
 * see http://www.gnu.org/licenses/gpl.html
 */

var d3       = require('d3'),
    Bluebird = require('bluebird'),
    _        = require('lodash');

module.exports = function(options) {
  var packLayout = d3.pack()
    .padding(2)
    .size([options.diameter, options.diameter]);

  var normaliseData = function(data) {
    _.each(data.children, function(node) {
      node.name = _.last(node[options.nameProperty].split('/'));
    });
  };

  this.toSeries = Bluebird.method(function(data) {
    if (_.isEmpty(data.children)) {
      return null;
    }
    normaliseData(data);

    var rootNode = d3.hierarchy(data);
    rootNode.sum(function(node) {
      return node[options.valueProperty];
    });
    packLayout(rootNode);

    return rootNode.descendants();
  });
};
