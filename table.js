var table = (function () {
  var mod = {};

  mod.setup = function () {
    // create table
    var table = d3.select('#content')
        .append('table').attr('class', 'table');

    // create table header
    table.append('thead').append('tr')
        .selectAll('th')
        .data(columns).enter()
        .append('th')
        .attr('class', function(x) { return x.cl; })
        .text(function(x) { return x.head; });
    table.append('tbody');
  }

  // code mostly from http://bl.ocks.org/gka/17ee676dc59aa752b4e6 and adapted to our purposes
  mod.update = function (){

    // DATA JOIN
    // Join new data with old elements, if any.
    var table = d3.select('table').select('tbody')
      .selectAll('tr').data(filtered_dataset);

    // Update existing rows
    table.selectAll('td').data(get_row_function)
      .html(function(x) { return x.html; })
      .attr('class', function(x) { return x.cl; });

    // Add new rows
    table.enter()
      .append('tr')
      .selectAll('td')
      .data(get_row_function).enter()
      .append('td')
      .html(function(x) { return x.html; })
      .attr('class', function(x) { return x.cl; });

    // Remove old elements as needed.
    table.exit().remove();
  }

  function get_row_function(row, i) {
    return columns.map(function(c) {
      // compute cell values for this specific row
      var cell = {};
      d3.keys(c).forEach(function(k) {
        cell[k] = typeof c[k] == 'function' ? c[k](row,i) : c[k];
      });
      return cell;
    });
  }

  return mod;
}());
