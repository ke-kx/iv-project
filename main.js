/*
make genderpie module as test

 split files by main, navigators, load/prepare data, and different display elements.
main has a "current display" var which contains method for current update contents function
just see how to clear the display and remove everything from the old method
remove custom elements from main.html (svgs and 2 divs for bars -> implement in display code)
   only navigation divs and display divs on toplevel

split first_setup into different parts for selecectors and other display shit
reserach how to remove everything below something
*/

// --- global variables
var full_dataset, filtered_dataset, gender_dataset;
var unique_columns, filtered_unique_columns;
var agegroups, riskgroups, gendergroups, stopcausesgroup, countryofinfectiongroup;
var riskgroup_bars, agegroup_bars;

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
d3.csv("data/patients_final.csv", function (data) {
  // load data
  console.log(data);
  full_dataset = data;
  filtered_dataset = full_dataset;

  //array with all unique values / column, only needs to be generated once
  unique_columns = columns.map(x => get_unique_column(x.html));
  filtered_unique_columns = unique_columns.map(column_filter);

  update_derived_data();

  // generate elements which only have to be generated once
  first_setup();

  // update everything
  update_select_boxes();
  update_genderpie();
  //generate_table();
  generate_bars(riskgroups, '#riskgroup_svg', true, "Riskgroups");
  generate_bars(agegroups, '#agegroup_svg', true, "Age of Infection");

  //dummy data
  generate_bars(riskgroups, '#group1_svg', true, "Placeholder 'stop causes'");
  generate_bars(agegroups, '#group2_svg', true, "Placeholder 'country'");
});

// Generate one time only things (selectors, etc)
function first_setup() {
//only testing
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


  //--- Generate Selectors
  //gender, riskgroup, agegroup, country x 2
  var selectors = ['riskgroup', 'agegroup', 'infection', 'origin'];

  // create one selection box for each set
  var select_boxes = d3.select('#selectors')
    .selectAll('select')
    .data(selectors).enter()
    .append('select')
    .attr('class', 'selectpicker').attr('multiple', 'multiple')
    .attr('id', x => x)
    .attr('data-width', "160px")
    .on('change', x => update_filters());

  //--- Create Gender Pie
  var dataset = [
    { name: 'F', percent: gendergroups["F"]/filtered_dataset.length},
    { name: 'M', percent: gendergroups["M"]/filtered_dataset.length}
  ];

  var pie=d3.pie()
    .value(function(d){return d.percent})
    .sort(null)
    .padAngle(.03);
  var w=170,h=200, radius = Math.min(w,h) / 2;
  var arc=d3.arc()
    .outerRadius(radius - 10)
    .innerRadius(radius - 50);
  var color = d3.scaleOrdinal(d3.schemeCategory20);

  var svg=d3.select("#Gender")
    .append("svg")
    .attr("width", w).attr("height",h)
    .attr("class", 'shadow').append('g')
    .attr("transform", 'translate('+w/2+','+h/2+')');

  var path=svg.selectAll('path')
    .data(pie(dataset)).enter()
    .append('path').attr("d",arc)
    .attr("fill", function(d,i){return color(d.data.name);})
    .on('click', catch_genderpie_click);

  svg.selectAll('text')
    .data(pie(dataset)).enter()
    .append('text')
    .attr("transform", function(d) {return "translate(" + arc.centroid(d) + ")";})
    .attr("dy", ".35em").text(function(d) { return d.data.name; });
}

function update_select_boxes(){
  //gender, riskgroup, agegroup, country x 2
  var select_data = [
    filtered_unique_columns[1],
    agegroups.map(x => x.string),
    filtered_unique_columns[4], // country of infection
    filtered_unique_columns[5]  // country of origin
  ];

  // select all select boxes options and connect them with new data
  var select_contents = d3.select('#selectors').selectAll('select').data(select_data)
    .selectAll('option')
    .data((row, i) => select_data[i]);

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

// main update function, reads currently selected filters and applies them before updating the display
function update_filters() {
  // riskgroup, country x 2 are at position 1, 4, 5
  var normal_idx = [1, 4, 5];
  for (var i in normal_idx) {
    columns[normal_idx[i]].filter = $('#'+columns[normal_idx[i]].cl).val();
  }

  //agegroup
  var selected_agegroups = $('#agegroup').val();
  columns[2].filter = [];
  for (var ag in agegroups) {
    if (selected_agegroups.includes(ag.string)) {
      for (var i = ag.min; i < ag.max; i++) {
        selected_agegroups.push(i);
      }
    }
  }

  // apply filter and update data
  filtered_dataset = full_dataset.filter(filter_function);
  filtered_unique_columns = unique_columns.map(column_filter);
  update_derived_data()

  // update display
  update_select_boxes();
  update_genderpie();
  generate_bars(riskgroups, '#riskgroup_svg', false);
  generate_bars(agegroups, '#agegroup_svg', false);
  //generate_table();

    //dummy data
  generate_bars(riskgroups, '#group1_svg', false);
  generate_bars(agegroups, '#group2_svg', false);
}

function column_filter(column, i) {
    // no filter selected for this column -> only get possible values
    if (columns[i] && columns[i].filter.length == 0) {
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

function catch_genderpie_click (d) {
  if (columns[0].filter.includes(d.data.name)) columns[0].filter = [];
  else  columns[0].filter = [d.data.name];
  update_filters();
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

// reset all derived data arrays to their initial state (0,0,0,...)
function resetgroups(){
  // divide agegroups into <16 and then intervals of 5 (16-20, 21-25, ...)
  agegroups = [{min: 0, max: 15, string:"<16", count: 0, percent:0}];
  for(var i=1; i<9; i++){
   agegroups[i] = {min: 11+i*5, max: 15+i*5, string: (11+i*5) +"-" + (15+i*5), count: 0, percent: 0};
 }
 agegroups[9] = {min:56, max: 100, string:"56+", count: 0, percent:0}
 agegroups[10] = {min:-9999, max: -1, string:"unknown", count: 0, percent: 0}

 riskgroups = [
  { string: "homosexual/bisexual", count: 0, percent: 0},
  { string: "blood products", count: 0, percent: 0},
  { string: "heterosexual", count: 0, percent: 0},
  { string: "other", count: 0, percent: 0},
  { string: "IVDA", count: 0, percent: 0},
  { string: "vertical transmission", count: 0, percent: 0}
];

gendergroups = {"M": 0, "F": 0};
}

function update_derived_data() {
  //first reset the groups to start at 0 entries
  resetgroups();

  // go through whole dataset once and count all occurences
  for (var i = 0; i < filtered_dataset.length; i++) {
    gendergroups[filtered_dataset[i].Gender]++;
    riskgroups.find(x => x.string==filtered_dataset[i].Risk).count++;

    if(filtered_dataset[i].age_at_infection<=-1){
      agegroups[10].count++;
    } else if(filtered_dataset[i].age_at_infection <=15){
      agegroups[0].count++;
    } else if(filtered_dataset[i].age_at_infection >= 56){
      agegroups[9   ].count++;
    } else {
      var index=Math.ceil((filtered_dataset[i].age_at_infection-15)/5);
      if(!isNaN(index)) agegroups[index].count++;
    }
  }

  //toDo StopCauses
  //toDo CountryOfInfection

  // update riskgroups percentages
  for (var i in riskgroups) {
    riskgroups[i].percent = riskgroups[i].count / filtered_dataset.length;
  }
  for (var i in agegroups) {
    agegroups[i].percent = agegroups[i].count / filtered_dataset.length;
  }
}

// toDo
function countStopCauses(){
  var ret = {"s1": 0};
  for (var i = 0; i < filtered_dataset.length; i++) {
    ret[filtered_dataset[i].Risk]++;
  }
  return ret;
}
// toDo
function countCountryOfInfection(){
  var ret = {"s1":0}
  for (var i = 0; i < filtered_dataset.length; i++) {
    ret[filtered_dataset[i].Risk]++;
  }
  return ret;
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

function generate_bars(data, target, first_time, title) {
  // Mike Bostock "margin conventions"
  var margin = {top: 20, right: 20, bottom: 30, left: 40},
    width = 500 - margin.left - margin.right,
    height = 300 - margin.top - margin.bottom;

  // D3 scales = just math
  // x is a function that transforms from "domain" (data) into "range" (usual pixels)
  // domain gets set after the data loads
  var x = d3.scaleBand().rangeRound([0, width]).padding(0.1)

  var y = d3.scaleLinear()
    .range([height, 0]);

  // D3 Axis - renders a d3 scale in SVG
  var xAxis = d3.axisBottom(x);

  var yAxis = d3.axisLeft(y)
    .ticks(10, "%");

  var tip = d3.tip()
    .attr('class', 'd3-tip')
    .offset([-10, 0])
    .html(function(d) {
      return "<strong>Percentage:</strong> <span style='color:red'>" + Math.round (d.percent*10000)/100 + "%</span> \
        <br><strong>Total:</strong> <span style='color:red'>" +  d.count + " / " + filtered_dataset.length + "</span>";
  })

  if (first_time) {
    var svg = d3.select(target)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")

    svg.append("g")
      .attr("class", "y axis")
    .append("text") // just for the title (ticks are automatic)
      .attr("transform", "rotate(-90)") // rotate the text!
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Frequency");

    //title text
    svg.append("text")
      .attr("x", (width/2))
      .attr("y", 35)
      .attr("text-anchor", "middle")
      .style("font-weight", "bold")
      .text(title)
  } else {
    var svg = d3.select(target);
  }

  svg.call(tip);

  // measure the domain (for x, unique letters) (for y [0,maxFrequency])
  // now the scales are finished and usable
  x.domain(data.map(function(d) { return d.string; }));
  y.domain([0, d3.max(data, function(d) { return d.percent; })]);

  // another g element, this time to move the origin to the bottom of the svg element
  // someSelection.call(thing) is roughly equivalent to thing(someSelection[i])
  //   for everything in the selection\
  // the end result is g populated with text and lines!
  svg.select('.x.axis').transition().duration(300).call(xAxis);

  // same for yAxis but with more transform and a title
  svg.select(".y.axis").transition().duration(300).call(yAxis)

  // THIS IS THE ACTUAL WORK!
  var bars = svg.selectAll(".bar").data(data, function(d) { return d.string; }) // (data) is an array/iterable thing, second argument is an ID generator function

  bars.attr("class", "bar")
    .attr("width", x.bandwidth()) // constant, so no callback function(d) here
    .attr("x", function(d) { return x(d.string); })
    .attr("y", function(d) { return y(d.percent); })
    .attr("height", function(d) { return height - y(d.percent); })
    .on('mouseover', tip.show)
    .on('mouseout', tip.hide);

  // data that needs DOM = enter() (a set/selection, not an event!)
  bars.enter().append("rect")
    .attr("class", "bar")
    .attr("width", x.bandwidth()) // constant, so no callback function(d) here
    .attr("x", function(d) { return x(d.string); })
    .attr("y", function(d) { return y(d.percent); })
    .attr("height", function(d) { return height - y(d.percent); })
    .on('mouseover', tip.show)
    .on('mouseout', tip.hide);

/*
  // the "UPDATE" set:
  bars.transition().duration(300).attr("x", function(d) { return x(d.string); }) // (d) is one item from the data array, x is the scale object from above
    .attr("width", x) // constant, so no callback function(d) here
    .attr("y", function(d) { return y(d.percent); })
    .attr("height", function(d) {
      console.log(d.percent);
      console.log(y(d.percent));
      return height - y(d.percent);
    }); // flip the height, because y's domain is bottom up, but SVG renders top down
  */

  bars.exit()
    .transition().duration(300)
    .attr("y", y(0))
    .attr("height", height - y(0))
    .style('fill-opacity', 1e-6)
    .remove();
}

function generate_bars_old(data, target, first_time){
  // local variables
  var svg = d3.select(target),
    svg_height = 300, svg_width = 500,
    margin = {top: 20, right: 20, bottom: 30, left: 40},
    height =  +svg.attr("height") - margin.top - margin.bottom,
    width =  +svg.attr("width") - margin.left - margin.right;

  // axes setup
  var x = d3.scaleBand().rangeRound([0, width]).padding(0.1),
      y = d3.scaleLinear().rangeRound([height, 0]);
  x.domain(data.map(function(d) { return d.string; }));
  y.domain([0, d3.max(data, function(d) { return d.percent; })]);


  if (first_time) {
    var g = svg.append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    g.append("g")
      .attr("class", "axis axis--x")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x));

    g.append("g")
      .attr("class", "axis axis--y")
      .call(d3.axisLeft(y).ticks(10, "%"))
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", "0.71em")
      .attr("text-anchor", "end")
      .text("Frequency");
  } else {
    var g = svg.select('g');

    g.select("g")
      .attr("class", "axis axis--x")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x));

    g.select("g")
      .attr("class", "axis axis--y")
      .call(d3.axisLeft(y).ticks(10, "%"))
    .select("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", "0.71em")
      .attr("text-anchor", "end")
      .text("Frequency");

    g.exit().remove();
  }

  g.selectAll(".bar")
    .data(data)
    .enter().append("rect")
      .attr("class", "bar")
      .attr("x", function(d) { return x(d.string); })
      .attr("y", function(d) { return y(d.percent); })
      .attr("width", x.bandwidth())
      .attr("height", function(d) { return height - y(d.percent); });
}
