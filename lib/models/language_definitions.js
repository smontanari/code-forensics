/*
 * code-forensics
 * Copyright (C) 2016-2021 Silvio Montanari
 * Distributed under the GNU General Public License v3.0
 * see http://www.gnu.org/licenses/gpl.html
 */

var _ = require('lodash');

var DefinitionsArchive = require('../utils').DefinitionsArchive;

module.exports = _.tap(new DefinitionsArchive(), function(archive) {
  _.each({
    ruby:       ['rb'],
    javascript: ['js']
  }, function(extensions, lang) { archive.addDefinition(lang, extensions); });
});
