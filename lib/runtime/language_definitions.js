var _ = require('lodash');
var DefinitionsArchive = require('../utils').DefinitionsArchive;

module.exports = _.tap(new DefinitionsArchive(), function(archive) {
  _.each({
    ruby:       ['rb'],
    javascript: ['js']
  }, function(extensions, lang) { archive.addDefinition(lang, extensions); });
});
