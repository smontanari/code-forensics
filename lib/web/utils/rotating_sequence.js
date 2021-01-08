/*
 * code-forensics
 * Copyright (C) 2016-2021 Silvio Montanari
 * Distributed under the GNU General Public License v3.0
 * see http://www.gnu.org/licenses/gpl.html
 */

module.exports = function(array) {
  var index = 0;

  this.next = function() {
    var nextElement = array[index++];
    if (index === array.length) {
      index = 0;
    }
    return nextElement;
  };
};
