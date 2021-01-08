/*
 * code-forensics
 * Copyright (C) 2016-2021 Silvio Montanari
 * Distributed under the GNU General Public License v3.0
 * see http://www.gnu.org/licenses/gpl.html
 */

var _ = require('lodash');

var BaseNodeHelper = require('./base_node_helper.js');

var NodeHelper = function(config) {
  BaseNodeHelper.call(this, config);
};

NodeHelper.prototype = Object.create(BaseNodeHelper.prototype);

_.extend(NodeHelper.prototype, {
  nodeColorValue: function(node) {
    return node.data[this.config.series.colorProperty];
  }
});

module.exports = NodeHelper;
