/*
 * code-forensics
 * Copyright (C) 2016-2021 Silvio Montanari
 * Distributed under the GNU General Public License v3.0
 * see http://www.gnu.org/licenses/gpl.html
 */

module.exports = function() {
  var definitions = {};

  this.addDefinition = function(name, definition) {
    definitions[name] = definition;
  };

  this.getDefinition = function(name) {
    return definitions[name];
  };
};
