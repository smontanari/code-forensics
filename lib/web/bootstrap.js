/*
 * code-forensics
 * Copyright (C) 2016-2017 Silvio Montanari
 * Distributed under the GNU General Public License v3.0
 * see http://www.gnu.org/licenses/gpl.html
 */

(function() {
  window.System.config({
    map: {
      lodash:   '/lib/lodash/lodash.js',
      knockout: '/lib/knockout/build/output/knockout-latest.js',
      bluebird: '/lib/bluebird/js/browser/bluebird.min.js',
      mustache: '/lib/mustache/mustache.min.js',
      d3:       '/lib/d3/build/d3.min.js',
      d3Cloud:  '/lib/d3-cloud/build/d3.layout.cloud.js',
      d3Tip:    '/lib/d3-tip/index.js'
    },
    meta: {
      'd3Cloud': { format: 'global', deps: ['d3'] }
    }
  });
  window.System.import('/js/main.js').then(function(module) { module.run(); });
})();
