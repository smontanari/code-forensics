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
  create: function(svgTag, parent, properties) {
    var d3Element = d3.select(document.createElementNS(d3.namespaces.svg, svgTag));
    D3Node.appendChild(parent, d3Element);
    this.applyProperties(d3Element, properties);
    return d3Element;
  }
};

