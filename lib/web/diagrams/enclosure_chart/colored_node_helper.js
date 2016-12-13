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
