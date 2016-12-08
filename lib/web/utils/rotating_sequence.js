module.exports = function(array) {
  var index = 0;

  this.next = function() {
    var nextElement = array[index++];
    if (index === array.length) {
      index = 0;
    }
    return nextElement;
  };
};
