var d3 = require('d3'),
    _  = require('lodash');

var D3Node      = require('./d3_node.js'),
    D3Transform = require('./d3_transform.js');

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
  create: function(svgTag, parent, definition) {
    var self = this;
    return _.tap(d3.select(document.createElementNS(d3.namespaces.svg, svgTag)), function(d3Element) {
      D3Node.appendChild(parent, d3Element);
      self.applyDefinition(d3Element, definition);
    });
  },
  append: function(parent, definition) {
    var self = this;
    return _.tap(parent.append(definition.type || 'g'), function(d3Element) {
      self.applyDefinition(d3Element, definition);
    });
  }
};
