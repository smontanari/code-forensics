/*
 * code-forensics
 * Copyright (C) 2016-2018 Silvio Montanari
 * Distributed under the GNU General Public License v3.0
 * see http://www.gnu.org/licenses/gpl.html
 */

var _ = require('lodash');

module.exports = function(layers) {
  this.isEmpty = function() {
    return _.isEmpty(layers);
  };

  this.toString = function() {
    return _.reduce(layers, function(lines, layer) {
      return lines.concat(_.map(layer.paths, function(path) {
        var pathString = path.toString();
        if (_.isRegExp(path)) {
          pathString = path.toString().slice(1, -1);
          if (!_.startsWith(pathString, '^')) { pathString = '^' + pathString; }
          if (!_.endsWith(pathString, '$')) { pathString += '$'; }
        }
        return pathString + ' => ' + layer.name;
      }));
    }, []).join('\n');
  };
};
