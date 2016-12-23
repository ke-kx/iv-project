/*
high:
  heatmap?!
    show whole countryname + top display solution for longer stuff
    add more possible datapoints to choose from (ageranges, stop causes..)

  filter for hover + display bars (just override?!)

medium:
  enable filtering by clicking on a bar of the barcharts
  wrap long country names in ybarchart - https://bl.ocks.org/mbostock/7555321
  main.html: change into column layout of bootstrap -> no problem with table?!
  change all groups to lookups instead of arrays?!

super low priority:
  genderpie: make text also transition around pie
*/

// --- global variables
var full_dataset, filtered_dataset, gender_dataset;
var unique_columns, filtered_unique_columns;
var unique_stop_causes, stopcauses_total;
var agegroups, riskgroups, gendergroups, stopcausesgroups, countryofinfectiongroups, riskagegroups;
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

   current_graph = heatmap;

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
  navigation.update(current_graph); //add current_graph to update to change selecetors depending on view
  current_graph.update()
}

function change_view(new_view) {
  // remove currently displayed content
  d3.select('#content').selectAll('*').remove();

  // remove navigation for heatmap
  if (new_view != heatmap) {
    console.log("Removing heatmap buttons");
    d3.select('#navigation').select('#heatmap_buttons').selectAll('*').remove();
  }

  current_graph = new_view;
  // disable und enable riskgroup drop down, doesnt make sense to change the riskgroups in the compare riskgroups view
  current_graph.setup()
  update();
}
