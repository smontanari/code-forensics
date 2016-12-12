var DeveloperInfo   = require_src('models/developer_info'),
    CFValidationError = require_src('models/validation_error');

describe('DeveloperInfo', function() {
  describe('with given team definitions', function() {
    it('raises an error when duplicate developer names exist', function() {
      expect(function() {
        new DeveloperInfo({
          'Team 1': ['Dev1', 'Dev2'],
          'Team 2': ['Dev3', ['Dev2', 'Alias dev 2']]
        });
      }).toThrowError(CFValidationError, 'Duplicate developer name: Dev2');
    });

    it('has team information', function() {
      expect(new DeveloperInfo({ 'Team 1': ['Dev1', 'Dev2', 'Dev3'] }).hasTeamInfo).toBeTruthy();
    });

    describe('.find()', function() {
      beforeEach(function() {
        this.subject = new DeveloperInfo({
          'Team 1': ['Dev1', 'Dev2', 'Dev3'],
          'Team 2': ['Dev4', ['Dev5', 'Alias dev 5']]
        });
      });

      it('returns an object with name and related team for an existing developer', function() {
        expect(this.subject.find('Dev3')).toEqual({ name: 'Dev3', team: 'Team 1'});
      });

      it('returns an object with the first available name and related team for an existing developer', function() {
        expect(this.subject.find('Alias dev 5')).toEqual({ name: 'Dev5', team: 'Team 2'});
      });

      it('returns an object with name and "N/A" team for a non-existing developer', function() {
        expect(this.subject.find('Dev0')).toEqual({ name: 'Dev0', team: 'N/A (Dev0)'});
      });
    });
  });

  describe('with only developer definitions', function() {
    it('raises an error when duplicate developer names exist', function() {
      expect(function() {
        new DeveloperInfo(['Dev1', 'Dev2', 'Dev3', ['Dev2', 'Alias dev 2']]);
      }).toThrowError(CFValidationError, 'Duplicate developer name: Dev2');
    });

    it('has no team information', function() {
      expect(new DeveloperInfo(['Dev1', 'Dev2', 'Dev3']).hasTeamInfo).toBeFalsy();
    });

    describe('.find()', function() {
      beforeEach(function() {
        this.subject = new DeveloperInfo(['Dev1', ['Dev2', 'Alias dev 2'], 'Dev3']);
      });

      it('returns an object with name and no team', function() {
        expect(new DeveloperInfo().find('Dev1')).toEqual({ name: 'Dev1' });
      });

      it('returns an object with the first available name and related team for an existing developer', function() {
        expect(this.subject.find('Alias dev 2')).toEqual({ name: 'Dev2' });
      });

      it('returns an object with name and no team for a non-existing developer', function() {
        expect(this.subject.find('Dev0')).toEqual({ name: 'Dev0' });
      });
    });
  });

  describe('with no or empty definitions', function() {
    describe('.find()', function() {
      it('returns an object with name and no team', function() {
        expect(new DeveloperInfo().find('a developer')).toEqual({ name: 'a developer' });
        expect(new DeveloperInfo([]).find('a developer')).toEqual({ name: 'a developer' });
        expect(new DeveloperInfo({}).find('a developer')).toEqual({ name: 'a developer' });
      });

      it('has no team information', function() {
        expect(new DeveloperInfo().hasTeamInfo).toBeFalsy();
        expect(new DeveloperInfo([]).hasTeamInfo).toBeFalsy();
        expect(new DeveloperInfo({}).hasTeamInfo).toBeFalsy();
      });
    });
  });
});
