/*
 * code-forensics
 * Copyright (C) 2016-2021 Silvio Montanari
 * Distributed under the GNU General Public License v3.0
 * see http://www.gnu.org/licenses/gpl.html
 */

var _ = require('lodash');

var Layer = function(layerConfig) {
  this.name = _.kebabCase(layerConfig.name);
  this.value = layerConfig.name;

  this.toString = function() {
    return _.reduce(layerConfig.paths, function(lines, path) {
      var pathString = path.toString();
      if (_.isRegExp(path)) {
        pathString = path.toString().slice(1, -1);
        if (!_.startsWith(pathString, '^')) { pathString = '^' + pathString; }
        if (!_.endsWith(pathString, '$')) { pathString += '$'; }
      }
      lines.push(pathString + ' => ' + layerConfig.name);
      return lines;
    }, []).join('\n');
  };
};

module.exports = function(config) {
  var layers = _.map(config, function(layerConfig) {
    return new Layer(layerConfig);
  });

  this.isEmpty = function() {
    return _.isEmpty(layers);
  };

  this.each = _.wrap(layers, _.each);
  this.map = _.wrap(layers, _.map);

  this.toString = function() {
    return _.reduce(layers, function(lines, layer) {
      lines.push(layer.toString());
      return lines;
    }, []).join('\n');
  };
};
