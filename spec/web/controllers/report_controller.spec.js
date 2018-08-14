/*global require_src*/
var _        = require('lodash'),
    Bluebird = require('bluebird');

var ReportController = require_src('web/controllers/report_controller');

describe('ReportController', function() {
  var graphModels;
  beforeEach(function() {
    spyOn(console, 'error');
  });

  describe('when all graph models are successfully initialized', function() {
    beforeEach(function() {
      graphModels = [
        { id: 'gm1', isSelected: jasmine.createSpy(), initialize: Bluebird.resolve },
        { id: 'gm2', isSelected: jasmine.createSpy(), initialize: Bluebird.resolve }
      ];
      new ReportController(graphModels);
    });

    it('selects the first graph model', function(done) {
      _.delay(function() {
        expect(graphModels[0].isSelected).toHaveBeenCalledWith(true);
        expect(graphModels[1].isSelected).not.toHaveBeenCalled();
        done();
      }, 10);
    });
  });

  describe('when some graph models are successfully initialized', function() {
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
        expect(graphModels[0].isSelected).not.toHaveBeenCalled();
        expect(graphModels[1].isSelected).toHaveBeenCalledWith(true);
        expect(graphModels[2].isSelected).not.toHaveBeenCalled();
        done();
      }, 10);
    });
  });

  describe('when no graph models are successfully initialized', function() {
    beforeEach(function() {
      graphModels = [
        { id: 'gm1', isSelected: jasmine.createSpy(), initialize: Bluebird.reject.bind(null, new Error()) },
        { id: 'gm2', isSelected: jasmine.createSpy(), initialize: Bluebird.reject.bind(null, new Error()) }
      ];
      new ReportController(graphModels);
    });

    it('selects the first graph model', function(done) {
      _.delay(function() {
        expect(graphModels[0].isSelected).toHaveBeenCalledWith(true);
        expect(graphModels[1].isSelected).not.toHaveBeenCalled();
        done();
      }, 10);
    });
  });

});
