var DeveloperInfo = require_src('models/developer_info');

describe('DeveloperInfo', function() {
  describe('with given team definitions', function() {
    describe('validation', function() {
      it('raises an error when duplicate developer names exist', function() {
        expect(function() {
          new DeveloperInfo({
            'Team 1': ['Dev1', 'Dev2'],
            'Team 2': ['Dev3', ['Dev2', 'Alias dev 2']]
          });
        }).toThrowError('Duplicate developer name: Dev2');
      });
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

  describe('with no given team definitions', function() {
    describe('.find()', function() {
      it('returns an object with name and "N/A" team', function() {
        expect(new DeveloperInfo().find('a developer')).toEqual({ name: 'a developer', team: 'N/A (a developer)'});
      });
    });
  });
});
