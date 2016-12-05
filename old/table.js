// --- global variables
var full_dataset, filtered_dataset;
var unique_columns, filtered_unique_columns;

var columns = [
    { head: 'Gender', cl: 'gender', filter: [],
      html: function(r) { return r.Gender; } },
    { head: 'Riskgroup', cl: 'riskgroup', filter: [],
      html: function(r) { return r.Risk; } },
    { head: 'Infection Age', cl: 'age_at_infection', filter: [],
      html: function(r) { return r.age_at_infection; } },
    { head: 'First Positive Test', cl: 'first_positive_test_date', filter: [],
      html: function(r) { return r.first_positive_test_date; } },
    { head: 'Country of Infection', cl: 'infection', filter: [],
      html: function(r) { return r.infection; } },
    { head: 'Country of Origin', cl: 'origin', filter: [],
      html: function(r) { return r.origin; } },
    { head: 'Year of Birth', cl: 'year_of_birth', filter: [],
      html: function(r) { return r.year_of_birth; } },
];

// --- entry point
d3.csv("data/patients_final.csv", function (data) {
    full_dataset = data;
    filtered_dataset = full_dataset;

    // --- Elements that only have to be created once
    //array with all unique values / column, only needs to be generated once
    unique_columns = columns.map(x => get_unique_column(x.html));
    filtered_unique_columns = unique_columns;

    // create table
    var table = d3.select('.table')
        .append('table').attr('class', 'table');

    // create table header
    table.append('thead').append('tr')
        .selectAll('th')
        .data(columns).enter()
        .append('th')
        .attr('class', function(x) { return x.cl; })
        .text(function(x) { return x.head; });
    table.append('tbody');

    // create one selection box for each column
    var select_boxes = d3.select('.selectors')
        .selectAll('select')
        .data(columns).enter()
        .append('select')
        .attr('class', 'selectpicker').attr('multiple', 'multiple')
        .attr('id', x => x.cl)
        .on('change', x => update_filters());

    //--- generate content
    update_select_boxes();
    generate_table();
});

// main update function, reads currently selected filters and applies them before updating the display
function update_filters() {
    //get currently selected (or unselected values for all ids in columns.head)
    for (var i = 0; i < columns.length; i++) {
        columns[i].filter = $('#'+columns[i].cl).val();
    }

    // apply filter
    filtered_dataset = full_dataset.filter(filter_function);
    filtered_unique_columns = unique_columns.map(column_filter);

    // update display
    update_select_boxes();
    generate_table();
}

function column_filter(column, i) {
    // no filter selected for this column -> only get possible values
    if (columns[i].filter.length == 0) {
        //TODO: find out which is quicker! // drop completely because it's too slow for full dataset?
        //column.filter(x => filtered_dataset.map(y => columns[i].html(y)).includes(x))
        return get_unique_column(columns[i].html)
    }
    // some filter selected -> display complete column
    return column;
}

// returns true if each attribute is eather in the filter list or the filter list is empty
function filter_function(x) {
    // compare each attribute
    for (var i = 0; i < columns.length; i++) {
        // if the filter list for this attribute is empty, we don't drop anything
        if (columns[i].filter && columns[i].filter.length != 0) {
            // if it is not empty it has to contain the entry (we are basically whitelisting)
            if (!columns[i].filter.includes(columns[i].html(x))) {
                return false;
            }
        }
    }
    // each attribute passed, so we include this entry in the filtered dataset
    return true;
}

function update_select_boxes(){

    // select all select boxes options and connect them with new data
    var select_contents = d3.select('.selectors').selectAll('select').data(columns)
        .selectAll('option')
        .data((row, i) => filtered_unique_columns[i])

    // update existing elements
    select_contents.text(function(x) {return x});

    // create new elements as needed
    select_contents.enter()
        .append('option')
        .text(function(x) {return x});

    // remove old elements
    select_contents.exit().remove();

    // necessary call to update the select box display
    $('.selectpicker').selectpicker('refresh');
}

// Generates an array with all unique values of one of the dataset columns
// takes an attr_function of the form function (x) { return x.ATTR }] as parameter
// adapted from https://stackoverflow.com/questions/17780508/selecting-distinct-values-from-a-json
function get_unique_column(attr_function) {
    var lookup = {};
    var result = [];

    for (var item, i = 0; item = filtered_dataset[i++];) {
      var name = attr_function(item);

      if (!(name in lookup)) {
        lookup[name] = 1;
        result.push(name);
      }
    }
    return result;
}

// code mostly from http://bl.ocks.org/gka/17ee676dc59aa752b4e6 and adapted to our purposes
function generate_table(){

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
