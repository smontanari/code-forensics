var DeveloperDataHelper = require_src('tasks/helpers/developer_data_helper'),
    DeveloperInfo       = require_src('models/developer_info');

describe('DeveloperDataHelper', function() {
  var testData = [
    { path: 'test/file1', author: 'Dev1', revisions: 3 },
    { path: 'test/file1', author: 'Dev2', revisions: 2 },
    { path: 'test/file1', author: 'Alias Dev1', revisions: 2 },
    { path: 'test/file1', author: 'Dev3', revisions: 1 },
    { path: 'test/file2', author: 'Dev2', revisions: 1 },
    { path: 'test/file2', author: 'Dev3', revisions: 4 },
    { path: 'test/file2', author: 'Unknown Dev', revisions: 3 }
  ];

  beforeEach(function() {
    this.subject = new DeveloperDataHelper({
      developerInfo: new DeveloperInfo({
        'Team 1': [['Dev1', 'Alias Dev1'], 'Dev2'],
        'Team 2': ['Dev3', 'Dev4']
      })
    });
  });

  describe('.aggregateBy()', function() {
    it('returns the data aggregated by individual author', function() {
      expect(this.subject.aggregateBy(testData, 'individual')).toEqual([
        {
          path: 'test/file1', children: [
            { name: 'Dev1', revisions: 5 },
            { name: 'Dev2', revisions: 2 },
            { name: 'Dev3', revisions: 1 }
          ]
        },
        {
          path: 'test/file2', children: [
            { name: 'Dev2', revisions: 1 },
            { name: 'Dev3', revisions: 4 },
            { name: 'Unknown Dev', revisions: 3 }
          ]
        }
      ]);
    });

    it('returns the data aggregated by team', function() {
      expect(this.subject.aggregateBy(testData, 'team')).toEqual([
        {
          path: 'test/file1', children: [
            { name: 'Team 1', revisions: 7 },
            { name: 'Team 2', revisions: 1 }
          ]
        },
        {
          path: 'test/file2', children: [
            { name: 'Team 1', revisions: 1 },
            { name: 'Team 2', revisions: 4 },
            { name: 'N/A (Unknown Dev)', revisions: 3 }
          ]
        }
      ]);
    });
  });
});
