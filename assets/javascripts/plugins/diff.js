(function(global, undefined) { 'use strict';
  var diffjs

  var Diff = function() {
    this.labels = {
      match: '',
      added: '+',
      removed: '-',
      changed: '*'
    }

    return this
  }

  Diff.prototype = {
    constructor: Diff,

    each: function(array, callback) {
      var i, length

      for (i = 0, length = array.length; i < length; i++) {
        callback.call(this, array[i], i);
      }
    },

    map: function(array, callback) {
      var results = Array(array.length)

      this.each(array, function(value, i) {
        results[i] = callback.call(this, value)
      })

      return results
    },

    replace: function(str, obj) {
      var output = String(str)

      this.each(Object.keys(obj), function(key) {
        var regex = new RegExp('{(' + key + '*?)}')
        output = output.replace(regex, obj[key])
      })

      return output
    },

    prepareFile: function(string) {
      return this.map(string.split(/\n/), function(line, i) {
        return {
          index: i,
          content: line
        }
      })
    },

    compare: function(oldString, newString) {
      var diff = [],
          oldFile = this.prepareFile(oldString),
          newFile = this.prepareFile(newString)

      var addToDiffResult = function(index, value, status, isOldCompared, isNewCompared) {
        diff.push({
          index: index + 1,
          value: value,
          label: this.labels[status],
          status: status
        })
      }.bind(this)


      this.each(newFile, function(newValue, newIndex) {
        this.each(oldFile, function(oldValue, oldIndex) {
          var changedValue

          if (oldValue.compared) return;
          if (newValue.compared) return;

          if (oldValue.content === newValue.content) {
            oldFile[oldIndex].compared = true
            newFile[newIndex].compared = true

            addToDiffResult(oldIndex, oldValue.content, 'match', true, true)
          } else {
            if ((oldFile.length - 1) === oldIndex) {
              if (!newIndex || (diff[newIndex] && diff[newIndex].status === 'match')) {
                changedValue = [oldFile[newIndex].content, newValue.content].join('|')
                oldFile[newIndex].compared = true
                newFile[newIndex].compared = true

                addToDiffResult(newIndex, changedValue, 'changed', true, true)
              }
            }
          }
        })
      })

      this.each(oldFile, function(value, index) {
        if (!value.compared) {
          addToDiffResult(index, value.content, 'removed')
        }
      })

      this.each(newFile, function(value) {
        if (!value.compared) {
          addToDiffResult(diff.length, value.content, 'added')
        }
      })

      return diff.sort(function(a, b) {
        return a.index > b.index ? 1 : (a.index < b.index) ? -1 : 0
      })
    }
  }

  diffjs = new Diff

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = diffjs
  } else if (typeof define === 'function' && define.amd) {
    define([], function() { return diffjs })
  } else if (typeof global.diffjs === 'undefined') {
    global.diffjs = diffjs
  }
}(this));
