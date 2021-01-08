/*
 * code-forensics
 * Copyright (C) 2016-2021 Silvio Montanari
 * Distributed under the GNU General Public License v3.0
 * see http://www.gnu.org/licenses/gpl.html
 */

module.exports = function() {
  if (window.navigator.languages) {
    return window.navigator.languages[0];
  }
  return window.navigator.language;
};
