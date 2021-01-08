/*
 * code-forensics
 * Copyright (C) 2016-2021 Silvio Montanari
 * Distributed under the GNU General Public License v3.0
 * see http://www.gnu.org/licenses/gpl.html
 */

var _ = require('lodash');

module.exports = {
  nodeWithName: function(name) {
    return function(node) { return node.name === name; };
  },
  nodeText: function(node) {
    var text = _.find(node.children, function(elem) { return elem.type === 'text'; }) || {};
    return text.value;
  }
};
