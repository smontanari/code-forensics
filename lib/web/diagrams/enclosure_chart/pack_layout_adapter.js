/*
 * code-forensics
 * Copyright (C) 2016-2021 Silvio Montanari
 * Distributed under the GNU General Public License v3.0
 * see http://www.gnu.org/licenses/gpl.html
 */

var d3       = require('d3'),
    Bluebird = require('bluebird'),
    _        = require('lodash');

var NodeMixin = {
  fullName: function() {
    return _.compact(_.map(_.reverse(this.ancestors()), function(node) {
      return node.data.name;
    })).join('/');
  },
  hasLayout: function() {
    return _.isNumber(this.r) && _.isNumber(this.x) && _.isNumber(this.y);
  },
  isRoot: function() {
    return _.isUndefined(this.parent);
  },
  isLeaf: function() {
    return _.isEmpty(this.children);
  }
};

module.exports = function(options) {
  var packLayout = d3.pack()
    .padding(2)
    .size([options.diameter, options.diameter]);

  this.toSeries = Bluebird.method(function(data) {
    if (_.isEmpty(data.children)) {
      return null;
    }
    var rootNode = d3.hierarchy(data);
    rootNode.sum(function(node) {
      return _.ceil(node[options.valueProperty]);
    });

    packLayout(rootNode);

    return _.filter(
      _.map(rootNode.descendants(), function(node) { return _.mixin(node, NodeMixin); }),
      function(node) { return node.hasLayout(); });
  });
};
