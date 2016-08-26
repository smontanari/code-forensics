require('d3');
var _ = require('lodash');

var D3Node = require('./d3_node.js');

module.exports = {
  applyProperties: function(d3Element, properties) {
    var props = properties || {};
    if (_.isPlainObject(props.offset)) {
      var offset = _.defaults({}, props.offset, { x: 0, y: 0 });
      d3Element.attr('transform', 'translate(' + [offset.x, offset.y].join(',') + ')');
    } else if (_.isFunction(props.offset)) {
      d3Element.attr('transform', function() {
        var offset = _.defaults(_.spread(props.offset)(arguments), { x: 0, y: 0 });
        return 'translate(' + [offset.x, offset.y].join(',') + ')';
      });
    }
    if (_.isNumber(props.rotation)) { d3Element.attr('transform', 'rotate(' + props.rotation + ')'); }
    if (props.attributes) { d3Element.attr(props.attributes); }
    _.each(['style', 'text', 'html'], function(fn) {
      if (props[fn]) { d3Element[fn](props[fn]); }
    });
  },
  create: function(svgTag, parent, properties) {
    var d3Element = d3.select(document.createElementNS(d3.ns.prefix.svg, svgTag));
    D3Node.appendChild(parent, d3Element);
    this.applyProperties(d3Element, properties);
    return d3Element;
  }
};

