var DefinitionsArchive = require_src('utils/definitions_archive');

describe('DefinitionsArchive', function() {
  it('archives definitions', function() {
    var archive = new DefinitionsArchive();
    archive.addDefinition('testD1', {obj: 'definition1'});

    expect(archive.getDefinition('testD1')).toEqual({obj: 'definition1'});
    expect(archive.getDefinition('testD2')).toBeUndefined();
  });
});
