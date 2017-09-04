var _        = require('lodash'),
    Bluebird = require('bluebird');

var ReportController = require_src('web/controllers/report_controller');

describe('ReportController', function() {
  var graphModels;

  beforeEach(function() {
    graphModels = [
      { id: 'gm1', isSelected: jasmine.createSpy(), initialize: Bluebird.reject.bind(null, new Error()) },
      { id: 'gm2', isSelected: jasmine.createSpy(), initialize: Bluebird.resolve },
      { id: 'gm3', isSelected: jasmine.createSpy(), initialize: Bluebird.resolve }
    ];
    new ReportController(graphModels);
  });

  it('selects the first graph model succesfully initialized', function(done) {
    _.delay(function() {
      expect(graphModels[1].isSelected).toHaveBeenCalledWith(true);
      done();
    }, 10);
  });
});
