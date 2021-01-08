/*
 * code-forensics
 * Copyright (C) 2016-2021 Silvio Montanari
 * Distributed under the GNU General Public License v3.0
 * see http://www.gnu.org/licenses/gpl.html
 */

var _  = require('lodash');

var D3Transform = require('./d3_transform.js');

module.exports = {
  applyProperties: function(d3Element, properties) {
    var props = properties || {};
    new D3Transform()
      .withOffset(props.offset)
      .withRotation(props.rotation)
      .applyToElement(d3Element);

    _.each(props.attributes, function(v, k) { d3Element.attr(k, v); });
    _.each(props.style, function(v, k) { d3Element.style(k, v); });
    _.each(['text', 'html'], function(fn) {
      if (props[fn]) { d3Element[fn](props[fn]); }
    });
  },
  applyInnerElements: function(d3Element, innerElements) {
    var self = this;
    _.each(innerElements, function(elementDefinition) {
      self.append(d3Element, elementDefinition);
    });
  },
  applyDefinition: function(d3Element, definition) {
    this.applyProperties(d3Element, definition.properties);
    this.applyInnerElements(d3Element, definition.innerElements);
  },
  append: function(parent, definition) {
    var self = this;
    return _.tap(parent.append(definition.elementType || 'g'), function(d3Element) {
      self.applyDefinition(d3Element, definition);
    });
  }
};
