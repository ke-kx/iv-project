/*
remove custom elements from main.html (svgs and 2 divs for bars -> implement in display code)
   only navigation divs and display divs on toplevel
   change into column layout of bootstrap -> no problem with table?!
*/

// --- global variables
var full_dataset, filtered_dataset, gender_dataset;
var unique_columns, filtered_unique_columns;
var agegroups, riskgroups, gendergroups, stopcausesgroup, countryofinfectiongroups;
var riskgroup_bars, agegroup_bars;

var current_graph;

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

// --- main entry point
main();

function main () {
  data.load(function () {

    current_graph = bars;

    // generate elements which only have to be generated once
    navigation.setup();
    current_graph.setup();

    update();
  });
}

//main update function, reads currently selected filters and applies them before updating the display
function update() {
  data.update();

    // update display
  navigation.update();
  current_graph.update()
}

function change_view(new_view) {
  // remove currently displayed content
  d3.select('#content').selectAll('*').remove();

  current_graph = new_view;
  current_graph.setup()
  update();
}
