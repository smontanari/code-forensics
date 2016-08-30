var d3 = require('d3'),
    _  = require('lodash');

module.exports = {
  appendChild: function(parentElement, childElement) {
    var parent = parentElement;
    if (_.isString(parentElement)) {
      parent = d3.select('#' + parentElement);
    }
    parent.append(function() { return childElement.node(); });
  },
  attachToParent: function(parentNode, childElement) {
    this.appendChild(d3.select(parentNode), childElement);
  }
};

