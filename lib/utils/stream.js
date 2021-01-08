/*
 * code-forensics
 * Copyright (C) 2016-2021 Silvio Montanari
 * Distributed under the GNU General Public License v3.0
 * see http://www.gnu.org/licenses/gpl.html
 */

var _           = require('lodash'),
    fs          = require('fs'),
    Bluebird    = require('bluebird'),
    isStream    = require('is-stream'),
    through2    = require('through2'),
    PassThrough = require('stream').PassThrough;

module.exports = {
  readFileToObjectStream: function(filepath, transformFn) {
    return _.tap(new PassThrough({ objectMode: true }), function(outStream) {
      fs.readFile(filepath, function(err, data) {
        if (err) {
          outStream.emit('error', err);
        } else {
          var outputObject = transformFn(data);
          if (_.isObject(outputObject)) { outStream.write(outputObject); }
          outStream.end();
        }
      });
    });
  },
  reduceToObjectStream: function(transformFn) {
    var chunks = [];
    return through2.obj(
      function(chunk, enc, callback) {
        chunks.push(chunk);
        callback();
      },
      function(callback) {
        if (chunks.length > 0) {
          var obj = transformFn(Buffer.concat(chunks, _.reduce(chunks, 'length', 0)));
          if (_.isObject(obj)) { this.push(obj); }
        }
        callback();
      }
    );
  },
  streamToPromise: function(stream) {
    return new Bluebird(function(resolve, reject) {
      if (isStream(stream)) {
        _.each(['end', 'finish'], function(eventName) {
          stream.on(eventName, resolve);
        });
        stream.on('error', reject);
      } else {
        reject(new Error('Not a stream'));
      }
    });
  },
  objectStreamToArray: function(stream) {
    return new Bluebird(function(resolve, reject) {
      var data = [];
      stream
        .on('data', data.push.bind(data))
        .once('end', resolve.bind(null, data))
        .once('error', reject);
    });
  }
};
