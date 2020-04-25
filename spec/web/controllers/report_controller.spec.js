var _        = require('lodash'),
    Bluebird = require('bluebird');

var ReportController = require('web/controllers/report_controller');

describe('ReportController', function() {
  var graphModels;
  beforeEach(function() {
    console.error = jest.fn();
  });

  describe('when all graph models are successfully initialized', function() {
    beforeEach(function() {
      graphModels = [
        { id: 'gm1', isSelected: jest.fn(), initialize: Bluebird.resolve },
        { id: 'gm2', isSelected: jest.fn(), initialize: Bluebird.resolve }
      ];
      new ReportController(graphModels);
    });

    it('selects the first graph model', function() {
      return new Bluebird(function(done) {
        _.delay(function() {
          expect(graphModels[0].isSelected).toHaveBeenCalledWith(true);
          expect(graphModels[1].isSelected).not.toHaveBeenCalled();
          done();
        }, 10);
      });
    });
  });

  describe('when some graph models are successfully initialized', function() {
    beforeEach(function() {
      graphModels = [
        { id: 'gm1', isSelected: jest.fn(), initialize: Bluebird.reject.bind(null, new Error()) },
        { id: 'gm2', isSelected: jest.fn(), initialize: Bluebird.resolve },
        { id: 'gm3', isSelected: jest.fn(), initialize: Bluebird.resolve }
      ];
      new ReportController(graphModels);
    });

    it('selects the first graph model succesfully initialized', function() {
      return new Bluebird(function(done) {
        _.delay(function() {
          expect(graphModels[0].isSelected).not.toHaveBeenCalled();
          expect(graphModels[1].isSelected).toHaveBeenCalledWith(true);
          expect(graphModels[2].isSelected).not.toHaveBeenCalled();
          done();
        }, 10);
      });
    });
  });

  describe('when no graph models are successfully initialized', function() {
    beforeEach(function() {
      graphModels = [
        { id: 'gm1', isSelected: jest.fn(), initialize: Bluebird.reject.bind(null, new Error()) },
        { id: 'gm2', isSelected: jest.fn(), initialize: Bluebird.reject.bind(null, new Error()) }
      ];
      new ReportController(graphModels);
    });

    it('selects the first graph model', function() {
      return new Bluebird(function(done) {
        _.delay(function() {
          expect(graphModels[0].isSelected).toHaveBeenCalledWith(true);
          expect(graphModels[1].isSelected).not.toHaveBeenCalled();
          done();
        }, 10);
      });
    });
  });
});
