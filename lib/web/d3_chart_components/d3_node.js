/*
 * code-forensics
 * Copyright (C) 2016-2021 Silvio Montanari
 * Distributed under the GNU General Public License v3.0
 * see http://www.gnu.org/licenses/gpl.html
 */

var d3 = require('d3'),
    _  = require('lodash');

var appendChildElement = function(parentElement, childElement) {
  var parent = parentElement;
  if (_.isString(parentElement)) {
    parent = d3.select('#' + parentElement);
  }
  parent.append(function() { return childElement.node(); });
};

module.exports = {
  createHtmlElement: function(htmlTag, parent) {
    return _.tap(d3.create(htmlTag), function(htmlElement) {
      appendChildElement(parent, htmlElement);
    });
  },
  createSvgElement: function(svgTag, parent) {
    return _.tap(d3.select(document.createElementNS(d3.namespaces.svg, svgTag)), function(d3Element) {
      appendChildElement(parent, d3Element);
    });
  }
};
