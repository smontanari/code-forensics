var d3 = require('d3'),
    _  = require('lodash');

var D3Node = require('./d3_node.js');

//TODO: refactor this baby
module.exports = {
  applyProperties: function(d3Element, properties) {
    var props = properties || {};
    var transform = [];
    if (_.isPlainObject(props.offset)) {
      var offset = _.defaults({}, props.offset, { x: 0, y: 0 });
      transform.push(function() { return 'translate(' + [offset.x, offset.y].join(',') + ')'; });
    } else if (_.isFunction(props.offset)) {
      transform.push(function() {
        var offset = _.defaults(_.spread(props.offset)(arguments), { x: 0, y: 0 });
        return 'translate(' + [offset.x, offset.y].join(',') + ')';
      });
    }
    if (_.isNumber(props.rotation)) {
      transform.push(function() { return 'rotate(' + props.rotation + ')'; });
    } else if (_.isFunction(props.rotation)) {
      transform.push(function() {
        return 'rotate(' + _.spread(props.rotation)(arguments) + ')';
      });
    }
    if (!_.isEmpty(transform)) {
      d3Element.attr('transform', function() {
        var args = arguments;
        return _.map(transform, function(fn) { return fn.apply(null, args); }).join('');
      });
    }

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

