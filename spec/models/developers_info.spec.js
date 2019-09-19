var DevelopersInfo    = require('models/developers_info'),
    CFValidationError = require('runtime/errors').CFValidationError;

describe('DevelopersInfo', function() {
  describe('with given team definitions', function() {
    it('raises an error when duplicate developer names exist', function() {
      expect(function() {
        new DevelopersInfo({
          'Team 1': ['Dev1', 'Dev2'],
          'Team 2': ['Dev3', ['Dev2', 'Alias dev 2']]
        });
      }).toThrow(CFValidationError, 'Duplicate developer name: Dev2');
    });

    it('has team information', function() {
      expect(new DevelopersInfo({ 'Team 1': ['Dev1', 'Dev2', 'Dev3'] }).hasTeamInfo).toBeTruthy();
    });

    describe('.find()', function() {
      var subject;
      beforeEach(function() {
        subject = new DevelopersInfo({
          'Team 1': ['Dev1', 'Dev2', 'Dev3'],
          'Team 2': ['Dev4', ['Dev5', 'Alias dev 5']]
        });
      });

      it('returns an object with name and related team for an existing developer', function() {
        expect(subject.find('Dev3')).toEqual({ name: 'Dev3', team: 'Team 1'});
      });

      it('returns an object with the first available name and related team for an existing developer', function() {
        expect(subject.find('Alias dev 5')).toEqual({ name: 'Dev5', team: 'Team 2'});
      });

      it('returns an object with name and "N/A" team for a non-existing developer', function() {
        expect(subject.find('Dev0')).toEqual({ name: 'Dev0', team: 'N/A (Dev0)'});
      });
    });
  });

  describe('with only developer definitions', function() {
    it('raises an error when duplicate developer names exist', function() {
      expect(function() {
        new DevelopersInfo(['Dev1', 'Dev2', 'Dev3', ['Dev2', 'Alias dev 2']]);
      }).toThrow(CFValidationError, 'Duplicate developer name: Dev2');
    });

    it('has no team information', function() {
      expect(new DevelopersInfo(['Dev1', 'Dev2', 'Dev3']).hasTeamInfo).toBeFalsy();
    });

    describe('.find()', function() {
      var subject;
      beforeEach(function() {
        subject = new DevelopersInfo(['Dev1', ['Dev2', 'Alias dev 2'], 'Dev3']);
      });

      it('returns an object with name and no team', function() {
        expect(new DevelopersInfo().find('Dev1')).toEqual({ name: 'Dev1' });
      });

      it('returns an object with the first available name and related team for an existing developer', function() {
        expect(subject.find('Alias dev 2')).toEqual({ name: 'Dev2' });
      });

      it('returns an object with name and no team for a non-existing developer', function() {
        expect(subject.find('Dev0')).toEqual({ name: 'Dev0' });
      });
    });
  });

  describe('with no or empty definitions', function() {
    describe('.find()', function() {
      it('returns an object with name and no team', function() {
        expect(new DevelopersInfo().find('a developer')).toEqual({ name: 'a developer' });
        expect(new DevelopersInfo([]).find('a developer')).toEqual({ name: 'a developer' });
        expect(new DevelopersInfo({}).find('a developer')).toEqual({ name: 'a developer' });
      });

      it('has no team information', function() {
        expect(new DevelopersInfo().hasTeamInfo).toBeFalsy();
        expect(new DevelopersInfo([]).hasTeamInfo).toBeFalsy();
        expect(new DevelopersInfo({}).hasTeamInfo).toBeFalsy();
      });
    });
  });
});
