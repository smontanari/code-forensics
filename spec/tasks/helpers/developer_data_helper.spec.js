var DeveloperDataHelper = require('tasks/helpers/developer_data_helper'),
    DevelopersInfo      = require('models/developers_info');

describe('DeveloperDataHelper', function() {
  var subject;
  describe('when team information exists', function() {
    beforeEach(function() {
      subject = new DeveloperDataHelper({
        developersInfo: new DevelopersInfo({
          'Team 1': [['Dev1', 'Alias Dev1'], 'Dev2'],
          'Team 2': ['Dev3', 'Dev4']
        })
      });
    });

    describe('effort ownership', function() {
      var testData = [
        { path: 'test/file1', author: 'Dev1', revisions: 3 },
        { path: 'test/file1', author: 'Dev2', revisions: 2 },
        { path: 'test/file1', author: 'Alias Dev1', revisions: 2 },
        { path: 'test/file1', author: 'Dev3', revisions: 1 },
        { path: 'test/file2', author: 'Dev2', revisions: 1 },
        { path: 'test/file2', author: 'Dev3', revisions: 4 },
        { path: 'test/file2', author: 'Unknown Dev', revisions: 3 }
      ];

      it('returns the data aggregated by individual author and sorted by ownership', function() {
        expect(subject.aggregateIndividualEffortOwnership(testData)).toEqual([
          {
            path: 'test/file1', authors: [
              { name: 'Dev1', revisions: 5, ownership: 63 },
              { name: 'Dev2', revisions: 2, ownership: 25 },
              { name: 'Dev3', revisions: 1, ownership: 13 }
            ]
          },
          {
            path: 'test/file2', authors: [
              { name: 'Dev3', revisions: 4, ownership: 50 },
              { name: 'Unknown Dev', revisions: 3, ownership: 38 },
              { name: 'Dev2', revisions: 1, ownership: 13 }
            ]
          }
        ]);
      });

      it('returns the data aggregated by team and sorted by ownership', function() {
        expect(subject.aggregateTeamEffortOwnership(testData)).toEqual([
          {
            path: 'test/file1', teams: [
              { name: 'Team 1', revisions: 7, ownership: 88 },
              { name: 'Team 2', revisions: 1, ownership: 13 }
            ]
          },
          {
            path: 'test/file2', teams: [
              { name: 'Team 2', revisions: 4, ownership: 50 },
              { name: 'N/A (Unknown Dev)', revisions: 3, ownership: 38 },
              { name: 'Team 1', revisions: 1, ownership: 13 }
            ]
          }
        ]);
      });
    });

    describe('code ownership', function() {
      var testData = [
        { path: 'test/file1', author: 'Dev1', addedLines: 2, deletedLines: 1 },
        { path: 'test/file1', author: 'Alias Dev1', addedLines: 3, deletedLines: 2 },
        { path: 'test/file1', author: 'Dev2', addedLines: 3, deletedLines: 0 },
        { path: 'test/file2', author: 'Dev2', addedLines: 4, deletedLines: 1 },
        { path: 'test/file2', author: 'Dev3', addedLines: 6, deletedLines: 3 },
        { path: 'test/file2', author: 'Dev4', addedLines: 5, deletedLines: 2 },
        { path: 'test/file3', author: 'Dev4', addedLines: 3, deletedLines: 1 },
        { path: 'test/file3', author: 'Dev3', addedLines: 9, deletedLines: 3 },
        { path: 'test/file3', author: 'Unknown Dev', addedLines: 2, deletedLines: 1 },
        { path: 'test/file4', author: 'Dev3', addedLines: 12, deletedLines: 4 }
      ];

      it('returns the data aggregated by individual author and sorted by ownership', function() {
        expect(subject.aggregateIndividualCodeOwnership(testData)).toEqual([
          {
            path: 'test/file1', authors: [
              { name: 'Dev1', addedLines: 5, ownership: 63 },
              { name: 'Dev2', addedLines: 3, ownership: 38 }
            ]
          },
          {
            path: 'test/file2', authors: [
              { name: 'Dev3', addedLines: 6, ownership: 40 },
              { name: 'Dev4', addedLines: 5, ownership: 33 },
              { name: 'Dev2', addedLines: 4, ownership: 27 }
            ]
          },
          {
            path: 'test/file3', authors: [
              { name: 'Dev3', addedLines: 9, ownership: 64 },
              { name: 'Dev4', addedLines: 3, ownership: 21 },
              { name: 'Unknown Dev', addedLines: 2, ownership: 14 }
            ]
          },
          {
            path: 'test/file4', authors: [
              { name: 'Dev3', addedLines: 12, ownership: 100 }
            ]
          }
        ]);
      });

      it('returns the data aggregated by team and sorted by ownership', function() {
        expect(subject.aggregateTeamCodeOwnership(testData)).toEqual([
          {
            path: 'test/file1', teams: [
              { name: 'Team 1', addedLines: 8, ownership: 100 }
            ]
          },
          {
            path: 'test/file2', teams: [
              { name: 'Team 2', addedLines: 11, ownership: 73 },
              { name: 'Team 1', addedLines: 4, ownership: 27 }
            ]
          },
          {
            path: 'test/file3', teams: [
              { name: 'Team 2', addedLines: 12, ownership: 86 },
              { name: 'N/A (Unknown Dev)', addedLines: 2, ownership: 14 }
            ]
          },
          {
            path: 'test/file4', teams: [
              { name: 'Team 2', addedLines: 12, ownership: 100 }
            ]
          }
        ]);
      });
    });
  });

  describe('when no team information exists', function() {
    beforeEach(function() {
      subject = new DeveloperDataHelper({
        developersInfo: new DevelopersInfo([['Dev1', 'Alias Dev1'], 'Dev2', 'Dev3', 'Dev4'])
      });
    });

    describe('effort ownership', function() {
      var testData = [
        { path: 'test/file1', author: 'Dev1', revisions: 3 },
        { path: 'test/file1', author: 'Dev2', revisions: 2 },
        { path: 'test/file1', author: 'Alias Dev1', revisions: 2 },
        { path: 'test/file1', author: 'Dev3', revisions: 1 },
        { path: 'test/file2', author: 'Dev2', revisions: 1 },
        { path: 'test/file2', author: 'Dev3', revisions: 4 },
        { path: 'test/file2', author: 'Unknown Dev', revisions: 3 }
      ];

      it('returns the data aggregated by individual author and sorted by ownership', function() {
        expect(subject.aggregateIndividualEffortOwnership(testData)).toEqual([
          {
            path: 'test/file1', authors: [
              { name: 'Dev1', revisions: 5, ownership: 63 },
              { name: 'Dev2', revisions: 2, ownership: 25 },
              { name: 'Dev3', revisions: 1, ownership: 13 }
            ]
          },
          {
            path: 'test/file2', authors: [
              { name: 'Dev3', revisions: 4, ownership: 50 },
              { name: 'Unknown Dev', revisions: 3, ownership: 38 },
              { name: 'Dev2', revisions: 1, ownership: 13 }
            ]
          }
        ]);
      });

      it('returns undefined data aggregated by team', function() {
        expect(subject.aggregateTeamEffortOwnership(testData)).toBeUndefined();
      });
    });

    describe('code ownership', function() {
      var testData = [
        { path: 'test/file1', author: 'Dev1', addedLines: 2, deletedLines: 1 },
        { path: 'test/file1', author: 'Alias Dev1', addedLines: 3, deletedLines: 2 },
        { path: 'test/file1', author: 'Dev2', addedLines: 3, deletedLines: 0 },
        { path: 'test/file2', author: 'Dev2', addedLines: 4, deletedLines: 1 },
        { path: 'test/file2', author: 'Dev3', addedLines: 6, deletedLines: 3 },
        { path: 'test/file2', author: 'Dev4', addedLines: 5, deletedLines: 2 },
        { path: 'test/file3', author: 'Dev4', addedLines: 3, deletedLines: 1 },
        { path: 'test/file3', author: 'Dev3', addedLines: 9, deletedLines: 3 },
        { path: 'test/file3', author: 'Unknown Dev', addedLines: 2, deletedLines: 1 },
        { path: 'test/file4', author: 'Dev3', addedLines: 12, deletedLines: 4 }
      ];

      it('returns the data aggregated by individual author and sorted by ownership', function() {
        expect(subject.aggregateIndividualCodeOwnership(testData)).toEqual([
          {
            path: 'test/file1', authors: [
              { name: 'Dev1', addedLines: 5, ownership: 63 },
              { name: 'Dev2', addedLines: 3, ownership: 38 }
            ]
          },
          {
            path: 'test/file2', authors: [
              { name: 'Dev3', addedLines: 6, ownership: 40 },
              { name: 'Dev4', addedLines: 5, ownership: 33 },
              { name: 'Dev2', addedLines: 4, ownership: 27 }
            ]
          },
          {
            path: 'test/file3', authors: [
              { name: 'Dev3', addedLines: 9, ownership: 64 },
              { name: 'Dev4', addedLines: 3, ownership: 21 },
              { name: 'Unknown Dev', addedLines: 2, ownership: 14 }
            ]
          },
          {
            path: 'test/file4', authors: [
              { name: 'Dev3', addedLines: 12, ownership: 100 }
            ]
          }
        ]);
      });

      it('returns undefined data aggregated by team', function() {
        expect(subject.aggregateTeamCodeOwnership(testData)).toBeUndefined();
      });
    });
  });
});
