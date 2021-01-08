/*
 * code-forensics
 * Copyright (C) 2016-2021 Silvio Montanari
 * Distributed under the GNU General Public License v3.0
 * see http://www.gnu.org/licenses/gpl.html
 */

var d3Cloud  = require('d3-cloud'),
    Bluebird = require('bluebird'),
    _        = require('lodash');

module.exports = function(options) {
  var layout = d3Cloud.layout.cloud();

  this.toSeries = function(data) {
    var maxCount = _.maxBy(data, function(word) { return word.count; }).count;

    var series = _.map(data, function(word) {
      return { text: word.text, count: word.count, size: word.count/maxCount * 100 };
    });

    return new Bluebird(function(resolve) {
      layout.words(series)
        .size([options.width, options.height])
        .fontSize(function(word) { return word.size; })
        .padding(options.wordPadding)
        .on('end', resolve)
        .start();
    });
  };
};
