/*
 * code-forensics
 * Copyright (C) 2016-2019 Silvio Montanari
 * Distributed under the GNU General Public License v3.0
 * see http://www.gnu.org/licenses/gpl.html
 */

var d3 = require('d3'),
    _  = require('lodash');

var copyToClipboard = function(text) {
  var handler = function(event) {
    event.clipboardData.setData('text/plain', text);
    document.removeEventListener('copy', handler, true);
    event.preventDefault();
  };

  document.addEventListener('copy', handler, true);
  document.execCommand('copy');
};

module.exports = {
  nodeEventHandler: function(options) {
    return function(node) {
      var text = _.isFunction(options.text) ? options.text(node) : options.text;
      copyToClipboard(text);
      if (options.message) { window.alert(options.message); } //eslint-disable-line no-alert
      d3.event.stopPropagation();
    };
  }
};
