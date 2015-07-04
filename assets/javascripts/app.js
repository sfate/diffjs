define('app', function(require, exports, module) { 'use strict';
  var diffjs = require('diffjs')

  document.getElementById('compare').addEventListener('mousedown', function(e) {
    var inputs = document.getElementsByClassName('compare-file'),
        template = document.getElementById('output_template').innerHTML,
        output,
        outputHTML = ''

    output = diffjs.compare(inputs[0].value, inputs[1].value)

    diffjs.each(output, function(res) {
      outputHTML += diffjs.replace(template, res)
    })

    document.querySelector('#output tbody').innerHTML = outputHTML
  })

});
