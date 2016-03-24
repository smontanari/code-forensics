var _ = require('lodash');
var DefinitionsArchive = require('../utils').DefinitionsArchive;

var languageDefinitions = new DefinitionsArchive();

_.each({
  ruby:       ['rb'],
  javascript: ['js']
}, function(extensions, lang) { languageDefinitions.addDefinition(lang, extensions); });

module.exports = languageDefinitions;
