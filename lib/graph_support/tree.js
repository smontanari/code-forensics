/*
 * code-forensics
 * Copyright (C) 2016-2021 Silvio Montanari
 * Distributed under the GNU General Public License v3.0
 * see http://www.gnu.org/licenses/gpl.html
 */

var _ = require('lodash');

var TreeNode = require('./tree_node');

module.exports = function(rootName, nameProperty) {
  this.rootNode = new TreeNode();
  var rootNameRegexp = new RegExp('^' + rootName + '/');

  this.addNode = function(item) {
    var name = item[nameProperty].replace(rootNameRegexp, '');
    var childNode = this.rootNode.getChildNode(name);
    _.forOwn(item, function(value, key) {
      if (key === nameProperty) { return; }
      childNode[key] = value;
    });
    return childNode;
  };
};
